import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { BlogDBModel } from '../../domain/types'
import { BlogsRepository } from '../../infrastructure/blogs.repository'

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<InterLayerObject> {
    const { blogId, name, description, websiteUrl } = command
    const blog = await this.blogsRepository.getBlogById(blogId)
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
    const isUpdated = await this.blogsRepository.updateBlog(blogId, updatedBlog)
    if (!isUpdated) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
