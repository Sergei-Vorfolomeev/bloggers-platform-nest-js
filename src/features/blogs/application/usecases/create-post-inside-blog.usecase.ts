import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { PostInputModelWithBlogId } from '../../../posts/api/models/post.input.model'
import { BlogsRepository } from '../../infrastructure/blogs.repository'
import { PostsService } from '../../../posts/application/posts.service'

export class CreatePostInsideBlogCommand {
  constructor(
    public blogId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(CreatePostInsideBlogCommand)
export class CreatePostInsideBlogUseCase implements ICommandHandler {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: CreatePostInsideBlogCommand,
  ): Promise<InterLayerObject<string>> {
    const { blogId, title, shortDescription, content } = command
    const blog = await this.blogsRepository.getBlogById(blogId)
    if (!blog) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    const inputDataWithBlogId: PostInputModelWithBlogId = {
      title,
      shortDescription,
      content,
      blogId: blog._id.toString(),
    }
    return await this.postsService.createPost(inputDataWithBlogId)
  }
}
