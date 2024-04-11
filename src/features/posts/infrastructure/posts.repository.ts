import { PostDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import { Post, PostDocument } from '../domain/post.entity'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async createPost(post: PostDBModel) {
    try {
      const newPost = new this.postModel(post)
      await newPost.save()
      return newPost._id.toString()
    } catch (e) {
      console.log(e)
      return null
    }
  }
}
