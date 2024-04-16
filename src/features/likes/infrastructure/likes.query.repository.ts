import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Like, LikeModelWithStatics } from '../domain/like.entity'
import { LikeStatus } from '../domain/types'
import { LikeDetailsOutputModel } from '../api/models/like.output.model'

@Injectable()
export class LikesQueryRepository {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: LikeModelWithStatics,
  ) {}

  async getCommentLikeStatus(
    commentId: string,
    userId: string,
  ): Promise<LikeStatus | null> {
    try {
      const like = await this.likeModel
        .findOne({ commentId, userId })
        .lean()
        .exec()
      if (!like) {
        return null
      }
      return like.likeStatus
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getPostLikeStatus(
    postId: string,
    userId: string,
  ): Promise<LikeStatus | null> {
    try {
      const like = await this.likeModel
        .findOne({ postId, userId })
        .lean()
        .exec()
      if (!like) {
        return null
      }
      return like.likeStatus
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getNewestLikes(
    postId: string,
  ): Promise<LikeDetailsOutputModel[] | null> {
    try {
      const newestLikes = await this.likeModel
        .find({ postId, likeStatus: 'Like' })
        .sort({ addedAt: -1 })
        .limit(3)
        .lean()
        .exec()
      return newestLikes.map((el) => ({
        userId: el.userId,
        login: el.login,
        addedAt: el.addedAt,
      }))
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
