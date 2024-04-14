import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { Blog, BlogDocument } from '../domain/blog.entity'
import { BlogDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async createBlog(blog: BlogDBModel): Promise<string | null> {
    try {
      const newBlog = new this.blogModel(blog)
      await newBlog.save()
      return newBlog._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async deleteBlog(id: string): Promise<boolean> {
    try {
      const res = await this.blogModel.deleteOne({ _id: new ObjectId(id) })
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async getBlogById(id: string): Promise<BlogDocument | null> {
    try {
      return await this.blogModel.findOne({ _id: new ObjectId(id) })
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async updateBlog(blogId: string, blog: BlogDBModel): Promise<boolean> {
    try {
      const res = await this.blogModel.updateOne(
        { _id: new ObjectId(blogId) },
        blog,
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
