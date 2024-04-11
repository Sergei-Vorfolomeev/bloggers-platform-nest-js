import { Injectable } from '@nestjs/common'
import { BlogsRepository } from '../infrastructure/blogs.repository'
import { BlogInputModel } from '../api/models/blog.input.models'
import { BlogDBModel } from '../domain/types'
import { InterLayerObject, StatusCode } from '../../../base/interlayer-object'
import { PostsService } from '../../posts/application/posts.service'
import { PostInputModel } from '../../posts/api/models/post.input.model'

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
  ) {}

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

  async updateBlog(
    id: string,
    body: BlogInputModel,
  ): Promise<InterLayerObject> {
    const { name, description, websiteUrl } = body
    const blog = await this.blogsRepository.getBlogById(id)
    if (!blog) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    const updatedBlog: BlogDBModel = {
      name,
      description,
      websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }
    const isUpdated = await this.blogsRepository.updateBlog(id, updatedBlog)
    if (!isUpdated) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async createPostInsideBlog(
    blogId: string,
    body: Omit<PostInputModel, 'blogId'>,
  ): Promise<InterLayerObject<string>> {
    const { title, shortDescription, content } = body
    const blog = await this.blogsRepository.getBlogById(blogId)
    if (!blog) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    const inputDataWithBlogId: PostInputModel = {
      title,
      shortDescription,
      content,
      blogId: blog._id.toString(),
    }
    return await this.postsService.createPost(inputDataWithBlogId)
  }
}
