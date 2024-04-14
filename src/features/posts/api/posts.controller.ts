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
} from '@nestjs/common'
import { Paginator, QueryParams } from '../../../base/types'
import { PostsQueryRepository } from '../infrastructure/posts.query.repository'
import { PostOutputModel } from './models/post.output.model'
import { ObjectId } from 'mongodb'
import { PostInputModelWithBlogId } from './models/post.input.model'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { PostsService } from '../application/posts.service'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async getPosts(
    @Query() query: QueryParams,
  ): Promise<Paginator<PostOutputModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query
    const userId = null
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1]
    //   userId = await this.usersService.getUserId(token)
    // }
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
  async getPostById(@Param('id') postId: string): Promise<PostOutputModel> {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const userId = null
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1]
    //   userId = await this.usersService.getUserId(token)
    // }
    const post = await this.postsQueryRepository.getPostById(postId, userId)
    if (!post) {
      throw new NotFoundException()
    }
    return post
  }

  @Post()
  async createPost(
    @Body() body: PostInputModelWithBlogId,
  ): Promise<PostOutputModel> {
    const { statusCode, data: createdPostId } =
      await this.postsService.createPost(body)
    const userId = null
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1]
    //   userId = await this.usersService.getUserId(token)
    // }
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

  @HttpCode(204)
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException()
    }
    const { statusCode } = await this.postsService.deletePost(postId)
    handleExceptions(statusCode)
  }
}
