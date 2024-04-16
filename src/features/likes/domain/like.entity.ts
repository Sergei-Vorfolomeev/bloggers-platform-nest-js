import { FilterQuery, HydratedDocument, Model } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { LikeStatus } from './types'
import { ObjectId } from 'mongodb'

export type LikeDocument = HydratedDocument<Like>
export type LikeModel = Model<LikeDocument>
export type LikeModelWithStatics = Model<LikeDocument> & LikeStaticMethods

@Schema()
export class Like {
  @Prop({
    required: true,
  })
  userId: string

  @Prop({
    required: true,
  })
  login: string

  @Prop()
  postId: string

  @Prop()
  commentId: string

  @Prop({
    type: String,
    enum: ['Like', 'Dislike', 'None'],
  })
  likeStatus: LikeStatus

  @Prop({
    default: new Date().toISOString,
  })
  addedAt: string

  static async increaseLikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean> {
    try {
      const res = await entityModel.updateOne(
        { _id: new ObjectId(entityId) } as FilterQuery<T>,
        { $inc: { 'likesInfo.likesCount': 1 } },
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static async increaseDislikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean> {
    try {
      const res = await entityModel.updateOne(
        { _id: new ObjectId(entityId) } as FilterQuery<T>,
        { $inc: { 'likesInfo.dislikesCount': 1 } },
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static async decreaseLikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean> {
    try {
      const res = await entityModel.updateOne(
        { _id: new ObjectId(entityId) } as FilterQuery<T>,
        { $inc: { 'likesInfo.likesCount': -1 } },
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static async decreaseDislikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean> {
    try {
      const res = await entityModel.updateOne(
        { _id: new ObjectId(entityId) } as FilterQuery<T>,
        { $inc: { 'likesInfo.dislikesCount': -1 } },
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like)

LikeSchema.statics = {
  increaseLikesCount: Like.increaseLikesCount,
  increaseDislikesCount: Like.increaseDislikesCount,
  decreaseLikesCount: Like.decreaseLikesCount,
  decreaseDislikesCount: Like.decreaseDislikesCount,
}

type LikeStaticMethods = {
  increaseLikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean>
  increaseDislikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean>
  decreaseLikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean>
  decreaseDislikesCount<T>(
    entityId: string,
    entityModel: Model<T>,
  ): Promise<boolean>
}
