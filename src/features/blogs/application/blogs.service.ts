import { Injectable } from '@nestjs/common'
import { BlogsRepository } from '../infrastructure/blogs.repository'
import { BlogInputModel } from '../api/models/blog.input.models'
import { BlogDBModel } from '../domain/types'
import { InterLayerObject, StatusCode } from '../../../base/interlayer-object'

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async createBlog(body: BlogInputModel): Promise<InterLayerObject<string>> {
    const { name, description, websiteUrl } = body
    const newBlog: BlogDBModel = {
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    }
    const createdBlogId = await this.blogsRepository.createBlog(newBlog)
    if (!createdBlogId) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.Created, null, createdBlogId)
  }

  async deleteBlog(id: string): Promise<InterLayerObject> {
    const isDeleted = await this.blogsRepository.deleteBlog(id)
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
