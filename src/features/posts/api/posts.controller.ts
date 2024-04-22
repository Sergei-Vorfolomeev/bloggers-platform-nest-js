import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Paginator, QueryParams } from '../../../base/types'
import { PostsQueryRepository } from '../infrastructure/posts.query.repository'
import { PostOutputModel } from './models/post.output.model'
import { ObjectId } from 'mongodb'
import { PostInputModelWithBlogId } from './models/post.input.model'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { PostsService } from '../application/posts.service'
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard'
import { UsersService } from '../../users/application/users.service'
import { CommentInputModel } from '../../comments/api/models/comment.input.model'
import { CommentOutputModel } from '../../comments/api/models/comment.output.model'
import { CommentsService } from '../../comments/application/comments.service'
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository'
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard'
import { LikeInputModel } from '../../likes/api/models/like.input.model'
import { AccessToken } from '../../../infrastructure/decorators/access-token.decorator'
import { User } from '../../../infrastructure/decorators/user.decorator'
import { UserAttachedInRequest } from '../../users/api/models/user.input.model'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getPosts(
    @Query() query: QueryParams,
    @AccessToken() token: string | null,
  ): Promise<Paginator<PostOutputModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query
    let userId = null
    if (token) {
      userId = await this.usersService.getUserId(token)
    }
    const sortParams = {
      sortBy: sortBy ?? 'createdAt',
      sortDirection: sortDirection ?? 'desc',
      pageNumber: pageNumber ? +pageNumber : 1,
      pageSize: pageSize ? +pageSize : 10,
    }
    const posts = await this.postsQueryRepository.getPosts(sortParams, userId)
    if (!posts) {
      throw new InternalServerErrorException()
    }
    return posts
  }

  @Get(':id')
  async getPostById(
    @Param('id') postId: string,
    @AccessToken() token: string | null,
  ): Promise<PostOutputModel> {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    let userId = null
    if (token) {
      userId = await this.usersService.getUserId(token)
    }
    const post = await this.postsQueryRepository.getPostById(postId, userId)
    if (!post) {
      throw new NotFoundException()
    }
    return post
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() body: PostInputModelWithBlogId,
    @AccessToken() token: string | null,
  ): Promise<PostOutputModel> {
    const { statusCode, data: createdPostId } =
      await this.postsService.createPost(body)
    let userId = null
    if (token) {
      userId = await this.usersService.getUserId(token)
    }
    handleExceptions(statusCode)
    const post = await this.postsQueryRepository.getPostById(
      createdPostId!,
      userId,
    )
    if (!post) {
      throw new BadRequestException()
    }
    return post
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('id') postId: string,
    @Body() body: PostInputModelWithBlogId,
  ) {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const { statusCode } = await this.postsService.updatePost(postId, body)
    handleExceptions(statusCode)
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id') postId: string) {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const { statusCode } = await this.postsService.deletePost(postId)
    handleExceptions(statusCode)
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  async updateLikeStatus(
    @Param('id') postId: string,
    @Body() body: LikeInputModel,
    @User() { id: userId }: UserAttachedInRequest,
  ) {
    const { likeStatus } = body
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const { statusCode, error } = await this.postsService.updateLikeStatus(
      postId,
      userId,
      likeStatus,
    )
    handleExceptions(statusCode, error)
  }

  @Get(':id/comments')
  async getCommentsByPostId(
    @Param('id') postId: string,
    @Query() query: QueryParams,
    @AccessToken() token: string | null,
  ): Promise<Paginator<CommentOutputModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const sortParams = {
      sortBy: sortBy ?? 'createdAt',
      sortDirection: sortDirection ?? 'desc',
      pageNumber: pageNumber ? +pageNumber : 1,
      pageSize: pageSize ? +pageSize : 10,
    }
    let userId = null
    if (token) {
      userId = await this.usersService.getUserId(token)
    }
    const comments = await this.commentsQueryRepository.getCommentsByPostId(
      postId,
      sortParams,
      userId,
    )
    if (!comments) {
      throw new NotFoundException()
    }
    return comments
  }

  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  async createComment(
    @Param('id') postId: string,
    @Body() body: CommentInputModel,
    @User() { id: userId }: UserAttachedInRequest,
  ): Promise<CommentOutputModel> {
    const { content } = body
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const {
      statusCode,
      error,
      data: createdCommentId,
    } = await this.commentsService.createComment(postId, userId, content)
    handleExceptions(statusCode, error)
    const createdComment = await this.commentsQueryRepository.getCommentById(
      createdCommentId!,
      userId,
    )
    if (!createdComment) {
      throw new NotFoundException()
    }
    return createdComment
  }
}
