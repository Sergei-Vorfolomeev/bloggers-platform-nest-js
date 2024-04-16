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
    @Req() req: Request,
  ): Promise<CommentOutputModel> {
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException()
    }
    let userId = null
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
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
  async deleteComment(@Param('id') commentId: string, @Req() req: Request) {
    const { id: userId } = req.user
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
    @Req() req: Request,
    @Body() body: CommentInputModel,
  ) {
    const { content } = body
    const { id: userId } = req.user
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
    @Req() req: Request,
    @Body() body: LikeInputModel,
  ) {
    const { likeStatus } = body
    const { id: userId } = req.user
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
