import { Injectable } from '@nestjs/common'
import { PostInputModelWithBlogId } from '../api/models/post.input.model'
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository'
import {
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../base/interlayer-object'
import { PostDBModel } from '../domain/types'
import { PostsRepository } from '../infrastructure/posts.repository'
import { LikeDBModel, LikeStatus } from '../../likes/domain/types'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { LikesRepository } from '../../likes/infrastructure/likes.repository'

@Injectable()
export class PostsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async createPost(
    data: PostInputModelWithBlogId,
  ): Promise<InterLayerObject<string>> {
    const { title, shortDescription, content, blogId } = data
    const blog = await this.blogsRepository.getBlogById(blogId)
    if (!blog) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('blogId', "This blog doesn't exist"),
      )
    }
    const newPost: PostDBModel = {
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    }
    const createdPostId = await this.postsRepository.createPost(newPost)
    if (!createdPostId) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.Created, null, createdPostId)
  }

  async updatePost(
    postId: string,
    body: PostInputModelWithBlogId,
  ): Promise<InterLayerObject> {
    const { title, shortDescription, content, blogId } = body
    const post = await this.postsRepository.getPostById(postId)
    if (!post) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    const newPost: PostDBModel = {
      title,
      shortDescription,
      content,
      blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      likesInfo: post.likesInfo,
    }
    const isUpdated = await this.postsRepository.updatePost(postId, newPost)
    if (!isUpdated) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async deletePost(postId: string): Promise<InterLayerObject> {
    const isDeleted = await this.postsRepository.deletePost(postId)
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<InterLayerObject> {
    const user = await this.usersRepository.findUserById(userId)
    if (!user) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const post = await this.postsRepository.getPostById(postId)
    if (!post) {
      return new InterLayerObject(
        StatusCode.NotFound,
        "The post with provided id hasn't been found",
      )
    }
    // проверяем есть ли лайк юзера на посте
    const likeFromDB = await this.likesRepository.getPostLikeEntityByUserId(
      userId,
      postId,
    )
    if (!likeFromDB) {
      const newLikeEntity: LikeDBModel = {
        userId: user._id.toString(),
        login: user.login,
        postId,
        likeStatus,
        addedAt: new Date().toISOString(),
      }

      let createdLikeEntityId
      if (likeStatus === 'Like') {
        createdLikeEntityId = await this.postsRepository.addLike(
          postId,
          newLikeEntity,
        )
      }

      if (likeStatus === 'Dislike') {
        createdLikeEntityId = await this.postsRepository.addDislike(
          postId,
          newLikeEntity,
        )
      }

      if (likeStatus === 'None') {
        createdLikeEntityId = true
      }

      if (!createdLikeEntityId) {
        return new InterLayerObject(
          StatusCode.ServerError,
          "The like hasn't been created in the DB",
        )
      }

      return new InterLayerObject(StatusCode.NoContent)
    }
    // если лайк уже есть - обновляем
    switch (likeStatus) {
      case 'None': {
        if (likeFromDB.likeStatus === 'Like') {
          await this.postsRepository.removeLike(postId, userId)
        }
        if (likeFromDB.likeStatus === 'Dislike') {
          await this.postsRepository.removeDislike(postId, userId)
        }
        return new InterLayerObject(StatusCode.NoContent)
      }
      case 'Like': {
        if (likeFromDB.likeStatus === 'Dislike') {
          await this.postsRepository.removeDislike(postId, userId)
          const newLike: LikeDBModel = {
            userId: user._id.toString(),
            login: user.login,
            postId,
            likeStatus,
            addedAt: new Date().toISOString(),
          }
          await this.postsRepository.addLike(postId, newLike)
        }
        return new InterLayerObject(StatusCode.NoContent)
      }
      case 'Dislike': {
        if (likeFromDB.likeStatus === 'Like') {
          await this.postsRepository.removeLike(postId, userId)
          const dislike: LikeDBModel = {
            userId: user._id.toString(),
            login: user.login,
            postId,
            likeStatus,
            addedAt: new Date().toISOString(),
          }
          await this.postsRepository.addDislike(postId, dislike)
        }
        return new InterLayerObject(StatusCode.NoContent)
      }
    }
  }
}
