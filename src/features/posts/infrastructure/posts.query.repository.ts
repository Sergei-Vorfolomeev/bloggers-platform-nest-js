import { PostOutputModel } from '../api/models/post.output.model'
import { ObjectId, WithId } from 'mongodb'
import { PostDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Post, PostDocument } from '../domain/post.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

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

  async mapToView(
    posts: WithId<PostDBModel>[],
    userId: string | null,
  ): Promise<PostOutputModel[]> {
    return await Promise.all(
      posts.map(async (post) => {
        // let likeStatus: LikeStatus | null = null
        // if (userId) {
        //   likeStatus = await this.likesQueryRepository.getPostLikeStatus(
        //     post._id.toString(),
        //     userId,
        //   )
        // }
        // const newestLikes = await this.likesQueryRepository.getNewestLikes(
        //   post._id.toString(),
        // )
        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          // extendedLikesInfo: {
          //   likesCount: post.likesInfo.likesCount,
          //   dislikesCount: post.likesInfo.dislikesCount,
          // myStatus: likeStatus ?? 'None',
          // newestLikes: newestLikes ?? [],
          // },
        }
      }),
    )
  }
}
