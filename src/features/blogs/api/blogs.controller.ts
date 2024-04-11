import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository'
import { BlogViewModel } from './models/blog.output.models'
import { BlogInputModel, BlogsQueryParams } from './models/blog.input.models'
import { Paginator } from '../../../base/types'
import { ObjectId } from 'mongodb'
import { BlogsService } from '../application/blogs.service'
import { StatusCode } from '../../../base/interlayer-object'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query() queryParams: BlogsQueryParams,
  ): Promise<Paginator<BlogViewModel[]>> {
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
  async getBlogById(@Param('id') id: string): Promise<BlogViewModel> {
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
  async createBlog(@Body() body: BlogInputModel): Promise<BlogViewModel> {
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
}

export function handleExceptions(statusCode: StatusCode) {
  if (statusCode === StatusCode.BadRequest) {
    throw new BadRequestException()
  }
  if (statusCode === StatusCode.Unauthorized) {
    throw new UnauthorizedException()
  }
  if (statusCode === StatusCode.Forbidden) {
    throw new ForbiddenException()
  }
  if (statusCode === StatusCode.NotFound) {
    throw new NotFoundException()
  }
  if (statusCode === StatusCode.ServerError) {
    throw new InternalServerErrorException()
  }
}
