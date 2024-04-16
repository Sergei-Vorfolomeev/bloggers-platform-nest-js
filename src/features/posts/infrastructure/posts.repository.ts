import { PostDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import { Post, PostDocument, PostModelWithStatics } from '../domain/post.entity'
import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { Like, LikeModelWithStatics } from '../../likes/domain/like.entity'
import { LikeDBModel } from '../../likes/domain/types'

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModelWithStatics,
    @InjectModel(Like.name) private readonly likeModel: LikeModelWithStatics,
  ) {}

  async getPostById(postId: string): Promise<PostDocument | null> {
    try {
      return await this.postModel.findById(new ObjectId(postId)).exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async createPost(post: PostDBModel) {
    try {
      const newPost = new this.postModel(post)
      await newPost.save()
      return newPost._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async updatePost(postId: string, post: PostDBModel): Promise<boolean> {
    try {
      const res = await this.postModel.updateOne(
        { _id: new ObjectId(postId) },
        post,
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      const res = await this.postModel.deleteOne({ _id: new ObjectId(postId) })
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async addLike(postId: string, newLike: LikeDBModel): Promise<string | null> {
    try {
      return await this.postModel.addLike(
        postId,
        newLike,
        this.postModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async addDislike(
    postId: string,
    newDislike: LikeDBModel,
  ): Promise<string | null> {
    try {
      return await this.postModel.addDislike(
        postId,
        newDislike,
        this.postModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async removeLike(postId: string, userId: string): Promise<boolean> {
    try {
      return await this.postModel.removeLike(
        postId,
        userId,
        this.postModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async removeDislike(postId: string, userId: string): Promise<boolean> {
    try {
      return await this.postModel.removeDislike(
        postId,
        userId,
        this.postModel,
        this.likeModel,
      )
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
