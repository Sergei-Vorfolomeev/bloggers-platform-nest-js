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
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository'
import { BlogOutputModel } from './models/blog.output.models'
import { BlogInputModel, BlogsQueryParams } from './models/blog.input.models'
import { Paginator } from '../../../base/types'
import { ObjectId } from 'mongodb'
import { BlogsService } from '../application/blogs.service'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { PostOutputModel } from '../../posts/api/models/post.output.model'
import { PostInputModel } from '../../posts/api/models/post.input.model'
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query() queryParams: BlogsQueryParams,
  ): Promise<Paginator<BlogOutputModel[]>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParams
    const sortParams = {
      searchNameTerm: searchNameTerm ?? null,
      sortBy: sortBy ?? 'createdAt',
      sortDirection: sortDirection ?? 'desc',
      pageNumber: pageNumber ? +pageNumber : 1,
      pageSize: pageSize ? +pageSize : 10,
    }
    const blogs = await this.blogsQueryRepository.getBlogs(sortParams)
    if (!blogs) {
      throw new InternalServerErrorException()
    }
    return blogs
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogOutputModel> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException()
    }
    const blog = await this.blogsQueryRepository.getBlogById(id)
    if (!blog) {
      throw new NotFoundException()
    }
    return blog
  }

  @Post()
  async createBlog(@Body() body: BlogInputModel): Promise<BlogOutputModel> {
    const { statusCode, data: createdBlogId } =
      await this.blogsService.createBlog(body)
    handleExceptions(statusCode)
    const blog = await this.blogsQueryRepository.getBlogById(createdBlogId!)
    if (!blog) {
      throw new BadRequestException()
    }
    return blog
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string, @Body() body: BlogInputModel) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException()
    }
    const { statusCode } = await this.blogsService.updateBlog(id, body)
    handleExceptions(statusCode)
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException()
    }
    const { statusCode } = await this.blogsService.deleteBlog(id)
    handleExceptions(statusCode)
  }

  @Post(':id/posts')
  async createPostInsideBlog(
    @Param('id') blogId: string,
    @Body() body: Omit<PostInputModel, 'blogId'>,
  ): Promise<PostOutputModel> {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException()
    }
    const userId = null
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1]
    //   userId = await this.usersService.getUserId(token)
    // }
    const { statusCode, data: createdPostId } =
      await this.blogsService.createPostInsideBlog(blogId, body)
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
}
