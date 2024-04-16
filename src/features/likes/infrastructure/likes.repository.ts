import { InjectModel } from '@nestjs/mongoose'
import { Like, LikeModelWithStatics } from '../domain/like.entity'
import { Injectable } from '@nestjs/common'
import { LikeDBModel } from '../domain/types'
import { WithId } from 'mongodb'
import { Comment, CommentModel } from '../../comments/domain/comment.entity'
import { Post, PostModel } from '../../posts/domain/post.entity'

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: LikeModelWithStatics,
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModel,
    @InjectModel(Post.name) private readonly postModel: PostModel,
  ) {}

  async getPostLikeEntityByUserId(
    userId: string,
    postId: string,
  ): Promise<WithId<LikeDBModel> | null> {
    try {
      return await this.likeModel.findOne({ userId, postId }).lean().exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getCommentLikeEntityByUserId(
    userId: string,
    commentId: string,
  ): Promise<WithId<LikeDBModel> | null> {
    try {
      return await this.likeModel.findOne({ userId, commentId }).lean().exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
