import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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
  ): Promise<Paginator<BlogViewModel[]> | HttpException> {
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
  async getBlogById(
    @Param('id') id: string,
  ): Promise<BlogViewModel | HttpException> {
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
  async createBlog(
    @Body() body: BlogInputModel,
  ): Promise<BlogViewModel | HttpException> {
    const { statusCode, data: createdBlogId } =
      await this.blogsService.createBlog(body)
    switch (statusCode) {
      case StatusCode.Created: {
        const blog = await this.blogsQueryRepository.getBlogById(createdBlogId!)
        if (!blog) {
          throw new BadRequestException()
        }
        return blog
      }
      default: {
        throw new InternalServerErrorException()
      }
    }
  }

  @Put()
  async updateBlog() {}

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException()
    }
    const { statusCode } = await this.blogsService.deleteBlog(id)
    if (statusCode === StatusCode.NotFound) {
      throw new NotFoundException()
    }
  }
}
