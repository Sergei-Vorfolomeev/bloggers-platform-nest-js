import { PostOutputModel } from '../api/models/post.output.model'
import { ObjectId, WithId } from 'mongodb'
import { PostDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import { Post, PostModel } from '../domain/post.entity'
import { Injectable } from '@nestjs/common'
import { Paginator, SortParams } from '../../../base/types'
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository'
import { LikesQueryRepository } from '../../likes/infrastructure/likes.query.repository'
import { LikeStatus } from '../../likes/domain/types'

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async getPostsWithFilter(
    filter: object,
    sortParams: SortParams,
    userId: string | null,
  ): Promise<Paginator<PostOutputModel[]> | null> {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = sortParams
      const posts = await this.postModel
        .find(filter)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortBy]: sortDirection })
        .lean()
        .exec()
      const totalCount = await this.postModel.countDocuments(filter)
      const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
      return {
        items: await this.mapToView(posts, userId),
        page: pageNumber,
        pageSize,
        pagesCount,
        totalCount,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getPosts(
    sortParams: SortParams,
    userId: string | null,
  ): Promise<Paginator<PostOutputModel[]> | null> {
    try {
      const filter = {}
      return await this.getPostsWithFilter(filter, sortParams, userId)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getPostById(
    postId: string,
    userId: string | null,
  ): Promise<PostOutputModel | null> {
    try {
      const post = await this.postModel
        .findById(new ObjectId(postId))
        .lean()
        .exec()
      if (!post) {
        return null
      }
      const res = await this.mapToView([post], userId)
      return res[0]
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getPostsByBlogId(blogId: string, sortParams: SortParams, userId: any) {
    try {
      const blog = await this.blogsQueryRepository.getBlogById(blogId)
      if (!blog) {
        return null
      }
      const filter = {
        blogId: {
          $eq: blog.id,
        },
      }
      return await this.getPostsWithFilter(filter, sortParams, userId)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  private async mapToView(
    posts: WithId<PostDBModel>[],
    userId: string | null,
  ): Promise<PostOutputModel[]> {
    return await Promise.all(
      posts.map(async (post) => {
        let likeStatus: LikeStatus | null = null
        if (userId) {
          likeStatus = await this.likesQueryRepository.getPostLikeStatus(
            post._id.toString(),
            userId,
          )
        }
        const newestLikes = await this.likesQueryRepository.getNewestLikes(
          post._id.toString(),
        )
        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: post.likesInfo.likesCount,
            dislikesCount: post.likesInfo.dislikesCount,
            myStatus: likeStatus ?? 'None',
            newestLikes: newestLikes ?? [],
          },
        }
      }),
    )
  }
}
