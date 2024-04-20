import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository'
import { InjectModel } from '@nestjs/mongoose'
import { Comment, CommentModel } from '../domain/comment.entity'
import { ObjectId, WithId } from 'mongodb'
import { CommentOutputModel } from '../api/models/comment.output.model'
import { CommentDBModel } from '../domain/types'
import { LikeStatus } from '../../likes/domain/types'
import { Paginator, SortParams } from '../../../base/types'
import { Injectable } from '@nestjs/common'
import { LikesQueryRepository } from '../../likes/infrastructure/likes.query.repository'

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModel,
    protected readonly postsQueryRepository: PostsQueryRepository,
    protected readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentOutputModel | null> {
    try {
      const comment = await this.commentModel
        .findById(new ObjectId(commentId))
        .lean()
        .exec()
      if (!comment) {
        return null
      }
      const res = await this.mapToView([comment], userId)
      return res[0]
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async getCommentsByPostId(
    postId: string,
    sortParams: SortParams,
    userId: string | null,
  ): Promise<Paginator<CommentOutputModel[]> | null> {
    try {
      const { sortBy, sortDirection, pageNumber, pageSize } = sortParams
      const post = await this.postsQueryRepository.getPostById(postId, userId)
      if (!post) {
        return null
      }
      const comments = await this.commentModel
        .where('postId')
        .equals(postId)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortBy]: sortDirection })
        .lean()
        .exec()
      const totalCount = await this.commentModel
        .countDocuments()
        .where('postId')
        .equals(postId)
      const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
      return {
        items: await this.mapToView(comments, userId),
        page: pageNumber,
        pageSize,
        pagesCount,
        totalCount,
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async mapToView(
    comments: WithId<CommentDBModel>[],
    userId: string | null,
  ): Promise<CommentOutputModel[]> {
    return await Promise.all(
      comments.map(async (comment) => {
        let likeStatus: LikeStatus | null = null
        if (userId) {
          likeStatus = await this.likesQueryRepository.getCommentLikeStatus(
            comment._id.toString(),
            userId,
          )
        }
        return {
          id: comment._id.toString(),
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: likeStatus ?? 'None',
          },
        }
      }),
    )
  }
}
