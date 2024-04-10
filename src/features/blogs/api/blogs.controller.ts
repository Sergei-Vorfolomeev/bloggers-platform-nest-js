import {
  Controller,
  Delete,
  Get,
  HttpExceptionOptions,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository'
import { BlogViewModel } from './models/blog.output.models'
import { BlogsQueryParams } from './models/blog.input.models'
import { Paginator } from '../../../base/types'

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  @Get()
  async getBlogs(
    @Query() queryParams: BlogsQueryParams,
  ): Promise<Paginator<BlogViewModel[]> | HttpExceptionOptions> {
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
      return new InternalServerErrorException()
    }
    return blogs
  }

  @Get(':id')
  async getBlogById(@Param() id: string) {}

  @Post()
  async createBlog() {}

  @Put()
  async updateBlog() {}

  @Delete()
  async deleteBlog() {}
}
