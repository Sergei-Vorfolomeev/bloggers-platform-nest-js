import { HydratedDocument, Model } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { LikeDBModel } from '../../likes/domain/types'
import { LikeModelWithStatics } from '../../likes/domain/like.entity'

export type PostDocument = HydratedDocument<Post>
export type PostModel = Model<PostDocument>
export type PostModelWithStatics = PostModel & PostStaticMethods

@Schema()
export class Post {
  @Prop({
    required: true,
  })
  title: string

  @Prop({
    required: true,
  })
  shortDescription: string

  @Prop({
    required: true,
  })
  content: string

  @Prop({
    required: true,
  })
  blogId: string

  @Prop({
    required: true,
  })
  blogName: string

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
    postId: string,
    like: LikeDBModel,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null> {
    try {
      const newLike = new likeModel(like)
      await newLike.save()
      await likeModel.increaseLikesCount<PostDocument>(postId, postModel)
      return newLike._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  static async addDislike(
    postId: string,
    dislike: LikeDBModel,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null> {
    try {
      const newDislike = new likeModel(dislike)
      await newDislike.save()
      await likeModel.increaseDislikesCount<PostDocument>(postId, postModel)
      return newDislike._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  static async removeLike(
    postId: string,
    userId: string,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean> {
    try {
      const res = await likeModel.deleteOne({
        postId,
        userId,
        likeStatus: 'Like',
      })
      await likeModel.decreaseLikesCount<PostDocument>(postId, postModel)
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static async removeDislike(
    postId: string,
    userId: string,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean> {
    try {
      const res = await likeModel.deleteOne({
        postId,
        userId,
        likeStatus: 'Dislike',
      })
      await likeModel.decreaseDislikesCount<PostDocument>(postId, postModel)
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

export const PostSchema = SchemaFactory.createForClass(Post)

PostSchema.statics = {
  addLike: Post.addLike,
  addDislike: Post.addDislike,
  removeLike: Post.removeLike,
  removeDislike: Post.removeDislike,
}

type PostStaticMethods = {
  addLike(
    postId: string,
    like: LikeDBModel,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null>

  addDislike(
    postId: string,
    dislike: LikeDBModel,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<string | null>

  removeLike(
    postId: string,
    userId: string,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean>

  removeDislike(
    postId: string,
    userId: string,
    postModel: PostModel,
    likeModel: LikeModelWithStatics,
  ): Promise<boolean>
}
