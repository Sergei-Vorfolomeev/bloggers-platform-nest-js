import { CommentDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import {
  Comment,
  CommentDocument,
  CommentModelWithStatics,
} from '../domain/comment.entity'
import { ObjectId } from 'mongodb'
import { Injectable } from '@nestjs/common'
import { Like, LikeModelWithStatics } from '../../likes/domain/like.entity'
import { LikeDBModel } from '../../likes/domain/types'

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelWithStatics,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelWithStatics,
  ) {}

  async getCommentById(commentId: string): Promise<CommentDocument | null> {
    try {
      return this.commentModel.findById(new ObjectId(commentId)).exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async createComment(comment: CommentDBModel): Promise<string | null> {
    try {
      const newComment = new this.commentModel(comment)
      await newComment.save()
      return newComment._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async updateComment(
    id: string,
    updatedComment: CommentDBModel,
  ): Promise<boolean> {
    try {
      const res = await this.commentModel.updateOne(
        { _id: new ObjectId(id) },
        updatedComment,
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async deleteCommentById(id: string): Promise<boolean> {
    try {
      const res = await this.commentModel.deleteOne({ _id: new ObjectId(id) })
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async addLike(
    commentId: string,
    newLike: LikeDBModel,
  ): Promise<string | null> {
    try {
      return await this.commentModel.addLike(
        commentId,
        newLike,
        this.commentModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async addDislike(
    commentId: string,
    newDislike: LikeDBModel,
  ): Promise<string | null> {
    try {
      return await this.commentModel.addDislike(
        commentId,
        newDislike,
        this.commentModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async removeLike(commentId: string, userId: string): Promise<boolean> {
    try {
      return await this.commentModel.removeLike(
        commentId,
        userId,
        this.commentModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async removeDislike(commentId: string, userId: string): Promise<boolean> {
    try {
      return await this.commentModel.removeDislike(
        commentId,
        userId,
        this.commentModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
