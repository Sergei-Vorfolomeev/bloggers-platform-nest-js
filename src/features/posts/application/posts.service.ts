import { Injectable } from '@nestjs/common'
import { PostInputModelWithBlogId } from '../api/models/post.input.model'
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository'
import {
  ErrorsMessages,
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../base/interlayer-object'
import { PostDBModel } from '../domain/types'
import { PostsRepository } from '../infrastructure/posts.repository'

@Injectable()
export class PostsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async createPost(
    data: PostInputModelWithBlogId,
  ): Promise<InterLayerObject<string>> {
    const { title, shortDescription, content, blogId } = data
    const blog = await this.blogsRepository.getBlogById(blogId)
    if (!blog) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new ErrorsMessages(new FieldError('blogId', "This blog doesn't exist")),
      )
    }
    const newPost: PostDBModel = {
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      // likesInfo: {
      //   likesCount: 0,
      //   dislikesCount: 0,
      // },
    }
    const createdPostId = await this.postsRepository.createPost(newPost)
    if (!createdPostId) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.Created, null, createdPostId)
  }

  async deletePost(postId: string): Promise<InterLayerObject> {
    const isDeleted = await this.postsRepository.deletePost(postId)
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
