import { Injectable } from '@nestjs/common'
import { InterLayerObject, StatusCode } from '../../../base/interlayer-object'
import { PostsRepository } from '../../posts/infrastructure/posts.repository'
import { CommentDBModel } from '../domain/types'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { CommentsRepository } from '../infrastructure/comments.repository'
import { LikeDBModel, LikeStatus } from '../../likes/domain/types'
import { LikesRepository } from '../../likes/infrastructure/likes.repository'

@Injectable()
export class CommentsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async createComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<InterLayerObject<string>> {
    const post = await this.postsRepository.getPostById(postId)
    if (!post) {
      return new InterLayerObject(
        StatusCode.NotFound,
        "The post with provided id haven't been found",
      )
    }
    const user = await this.usersRepository.findUserById(userId)
    if (!user) {
      return new InterLayerObject(
        StatusCode.NotFound,
        "The user hasn't been found",
      )
    }
    const newComment: CommentDBModel = {
      content,
      postId: post._id.toString(),
      commentatorInfo: {
        userId: user._id.toString(),
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    }
    const createdCommentId =
      await this.commentsRepository.createComment(newComment)
    if (!createdCommentId) {
      return new InterLayerObject(
        StatusCode.ServerError,
        "The comment hasn't been created in the DB",
      )
    }
    return new InterLayerObject(StatusCode.Success, null, createdCommentId)
  }

  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<InterLayerObject> {
    const comment = await this.commentsRepository.getCommentById(commentId)
    if (!comment) {
      return new InterLayerObject(
        StatusCode.NotFound,
        "The comment with provided id haven't been found",
      )
    }
    if (comment.commentatorInfo.userId !== userId) {
      return new InterLayerObject(
        StatusCode.Forbidden,
        'This user does not have credentials',
      )
    }
    const updatedComment: CommentDBModel = {
      likesInfo: comment.likesInfo,
      commentatorInfo: comment.commentatorInfo,
      postId: comment.postId,
      createdAt: comment.createdAt,
      content,
    }
    const isUpdated = await this.commentsRepository.updateComment(
      commentId,
      updatedComment,
    )
    if (!isUpdated) {
      return new InterLayerObject(
        StatusCode.ServerError,
        "The comment hasn't been updated in the DB",
      )
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<InterLayerObject> {
    const comment = await this.commentsRepository.getCommentById(commentId)
    if (!comment) {
      return new InterLayerObject(
        StatusCode.NotFound,
        "The comment with provided id haven't been found",
      )
    }
    if (comment.commentatorInfo.userId !== userId) {
      return new InterLayerObject(
        StatusCode.Forbidden,
        'This user does not have credentials',
      )
    }
    const isDeleted = await this.commentsRepository.deleteCommentById(commentId)
    if (!isDeleted) {
      return new InterLayerObject(
        StatusCode.ServerError,
        "The comment hasn't been deleted",
      )
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<InterLayerObject> {
    const user = await this.usersRepository.findUserById(userId)
    if (!user) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const comment = await this.commentsRepository.getCommentById(commentId)
    if (!comment) {
      return new InterLayerObject(
        StatusCode.NotFound,
        "The comment with provided id hasn't been found",
      )
    }
    // проверяем есть ли лайк юзера на комменте
    const likeFromDB = await this.likesRepository.getCommentLikeEntityByUserId(
      userId,
      commentId,
    )
    // если лайка нет - делаем новую запись в БД
    if (!likeFromDB) {
      const newLikeEntity: LikeDBModel = {
        userId: user._id.toString(),
        login: user.login,
        commentId,
        likeStatus,
        addedAt: new Date().toISOString(),
      }

      let createdLikeEntityId
      if (likeStatus === 'Like') {
        createdLikeEntityId = await this.commentsRepository.addLike(
          commentId,
          newLikeEntity,
        )
      }

      if (likeStatus === 'Dislike') {
        createdLikeEntityId = await this.commentsRepository.addDislike(
          commentId,
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
          await this.commentsRepository.removeLike(commentId, userId)
        }
        if (likeFromDB.likeStatus === 'Dislike') {
          await this.commentsRepository.removeDislike(commentId, userId)
        }
        return new InterLayerObject(StatusCode.NoContent)
      }
      case 'Like': {
        if (likeFromDB.likeStatus === 'Dislike') {
          await this.commentsRepository.removeDislike(commentId, userId)
          const newLike: LikeDBModel = {
            userId: user._id.toString(),
            login: user.login,
            commentId,
            likeStatus,
            addedAt: new Date().toISOString(),
          }
          await this.commentsRepository.addLike(commentId, newLike)
        }
        return new InterLayerObject(StatusCode.NoContent)
      }
      case 'Dislike': {
        if (likeFromDB.likeStatus === 'Like') {
          await this.commentsRepository.removeLike(commentId, userId)
          const dislike: LikeDBModel = {
            userId: user._id.toString(),
            login: user.login,
            commentId,
            likeStatus,
            addedAt: new Date().toISOString(),
          }
          await this.commentsRepository.addDislike(commentId, dislike)
        }
        return new InterLayerObject(StatusCode.NoContent)
      }
    }
  }
}
