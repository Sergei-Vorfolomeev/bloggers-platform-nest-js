import { Injectable } from '@nestjs/common'
import { BlogSortParams } from '../domain/types'
import { Blog, BlogDocument } from '../domain/blog.model'
import { blogMapper } from './blog.mapper'
import { BlogViewModel } from '../api/models/blog.output.models'
import { Paginator } from '../../../base/types'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlogs(
    sortParams: BlogSortParams,
  ): Promise<Paginator<BlogViewModel[]> | null> {
    try {
      const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
        sortParams
      let filter = {}
      if (searchNameTerm) {
        filter = {
          name: {
            $regex: searchNameTerm,
            $options: 'i',
          },
        }
      }
      const blogs = await this.blogModel
        .find(filter)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortBy]: sortDirection })
        .lean()
        .exec()
      const totalCount = await this.blogModel.countDocuments(filter)
      const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
      return {
        items: blogs.map(blogMapper),
        page: pageNumber,
        pageSize,
        pagesCount,
        totalCount,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
