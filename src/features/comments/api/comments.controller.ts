import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository'
import { CommentsService } from '../application/comments.service'
import { UsersService } from '../../users/application/users.service'
import { CommentOutputModel } from './models/comment.output.model'
import { ObjectId } from 'mongodb'
import { Request } from 'express'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { CommentInputModel } from './models/comment.input.model'
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard'
import { LikeInputModel } from '../../likes/api/models/like.input.model'
import { AccessToken } from '../../../infrastructure/decorators/params/access-token.decorator'
import { UserAttachedInRequest } from '../../users/api/models/user.input.model'
import { User } from '../../../infrastructure/decorators/params/user.decorator'

@Controller('comments')
export class CommentsController {
  constructor(
    protected readonly commentsService: CommentsService,
    protected readonly commentsQueryRepository: CommentsQueryRepository,
    protected readonly usersService: UsersService,
  ) {}

  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
    @AccessToken() token: string | null,
  ): Promise<CommentOutputModel> {
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException()
    }
    let userId = null
    if (token) {
      userId = await this.usersService.getUserId(token)
    }
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    )
    if (!comment) {
      throw new NotFoundException()
    }
    return comment
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @User() { id: userId }: UserAttachedInRequest,
  ) {
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException()
    }
    const { statusCode, error } = await this.commentsService.deleteComment(
      commentId,
      userId,
    )
    handleExceptions(statusCode, error)
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @User() { id: userId }: UserAttachedInRequest,
    @Body() body: CommentInputModel,
  ) {
    const { content } = body
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException()
    }
    const { statusCode, error } = await this.commentsService.updateComment(
      commentId,
      userId,
      content,
    )
    handleExceptions(statusCode, error)
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  async updateLikeStatus(
    @Param('id') commentId: string,
    @User() { id: userId }: UserAttachedInRequest,
    @Body() body: LikeInputModel,
  ) {
    const { likeStatus } = body
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException()
    }
    const { statusCode, error } = await this.commentsService.updateLikeStatus(
      commentId,
      userId,
      likeStatus,
    )
    handleExceptions(statusCode, error)
  }
}
