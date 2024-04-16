import { HydratedDocument, Model } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { LikeModelWithStatics } from '../../likes/domain/like.entity'
import { LikeDBModel } from '../../likes/domain/types'

export type CommentDocument = HydratedDocument<Comment>
export type CommentModel = Model<CommentDocument>
export type CommentModelWithStatics = CommentModel & CommentStaticMethods

@Schema()
export class Comment {
  @Prop({
    required: true,
  })
  content: string

  @Prop({
    required: true,
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
  })
  commentatorInfo: {
    userId: string
    userLogin: string
  }

  @Prop({
    required: true,
  })
  postId: string

  @Prop({
    default: new Date().toISOString,
  })
  createdAt: string

  @Prop({
    type: {
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 },
    },
  })
  likesInfo: {
    likesCount: number
    dislikesCount: number
  }

  static async addLike(
    commentId: string,
    like: LikeDBModel,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null> {
    try {
      const newLike = new likeModel(like)
      await newLike.save()
      await likeModel.increaseLikesCount<CommentDocument>(
        commentId,
        commentModel,
      )
      return newLike._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  static async addDislike(
    commentId: string,
    dislike: LikeDBModel,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null> {
    try {
      const newDislike = new likeModel(dislike)
      await newDislike.save()
      await likeModel.increaseDislikesCount<CommentDocument>(
        commentId,
        commentModel,
      )
      return newDislike._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  static async removeLike(
    commentId: string,
    userId: string,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean> {
    try {
      const res = await likeModel.deleteOne({
        commentId,
        userId,
        likeStatus: 'Like',
      })
      await likeModel.decreaseLikesCount<CommentDocument>(
        commentId,
        commentModel,
      )
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static async removeDislike(
    commentId: string,
    userId: string,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean> {
    try {
      const res = await likeModel.deleteOne({
        commentId,
        userId,
        likeStatus: 'Dislike',
      })
      await likeModel.decreaseDislikesCount<CommentDocument>(
        commentId,
        commentModel,
      )
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment)

CommentSchema.statics = {
  addLike: Comment.addLike,
  addDislike: Comment.addDislike,
  removeLike: Comment.removeLike,
  removeDislike: Comment.removeDislike,
}

type CommentStaticMethods = {
  addLike(
    commentId: string,
    like: LikeDBModel,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null>

  addDislike(
    commentId: string,
    dislike: LikeDBModel,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null>

  removeLike(
    commentId: string,
    userId: string,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean>

  removeDislike(
    commentId: string,
    userId: string,
    commentModel: CommentModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean>
}
