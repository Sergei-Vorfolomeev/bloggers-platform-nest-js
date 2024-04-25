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
  Req,
  UseGuards,
} from '@nestjs/common'
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository'
import { BlogOutputModel } from './models/blog.output.models'
import { BlogInputModel, BlogsQueryParams } from './models/blog.input.models'
import { Paginator, QueryParams } from '../../../base/types'
import { ObjectId } from 'mongodb'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { PostOutputModel } from '../../posts/api/models/post.output.model'
import { PostInputModel } from '../../posts/api/models/post.input.model'
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository'
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard'
import { Request } from 'express'
import { UsersService } from '../../users/application/users.service'
import { CommandBus } from '@nestjs/cqrs'
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase'
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase'
import { CreatePostInsideBlogCommand } from '../application/usecases/create-post-inside-blog.usecase'
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
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
  async getBlogById(@Param('id') blogId: string): Promise<BlogOutputModel> {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException()
    }
    const blog = await this.blogsQueryRepository.getBlogById(blogId)
    if (!blog) {
      throw new NotFoundException()
    }
    return blog
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: BlogInputModel): Promise<BlogOutputModel> {
    const { name, description, websiteUrl } = body
    const command = new CreateBlogCommand(name, description, websiteUrl)
    const { statusCode, data: createdBlogId } =
      await this.commandBus.execute(command)
    handleExceptions(statusCode)
    const blog = await this.blogsQueryRepository.getBlogById(createdBlogId!)
    if (!blog) {
      throw new BadRequestException()
    }
    return blog
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlog(@Param('id') blogId: string, @Body() body: BlogInputModel) {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException()
    }
    const { name, description, websiteUrl } = body
    const command = new UpdateBlogCommand(blogId, name, description, websiteUrl)
    const { statusCode } = await this.commandBus.execute(command)
    handleExceptions(statusCode)
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string) {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException()
    }
    const command = new DeleteBlogCommand(blogId)
    const { statusCode } = await this.commandBus.execute(command)
    handleExceptions(statusCode)
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') blogId: string,
    @Query() queryParams: QueryParams,
    @Req() req: Request,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryParams
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException()
    }
    let userId = null
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      userId = await this.usersService.getUserId(token)
    }
    const sortParams = {
      sortBy: sortBy ?? 'createdAt',
      sortDirection: sortDirection ?? 'desc',
      pageNumber: pageNumber ? +pageNumber : 1,
      pageSize: pageSize ? +pageSize : 10,
    }
    const posts = await this.postsQueryRepository.getPostsByBlogId(
      blogId,
      sortParams,
      userId,
    )
    if (!posts) {
      throw new NotFoundException()
    }
    return posts
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostInsideBlog(
    @Param('id') blogId: string,
    @Body() body: PostInputModel,
    @Req() req: Request,
  ): Promise<PostOutputModel> {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException()
    }
    let userId = null
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      userId = await this.usersService.getUserId(token)
    }
    const { title, shortDescription, content } = body
    const command = new CreatePostInsideBlogCommand(
      blogId,
      title,
      shortDescription,
      content,
    )
    const { statusCode, data: createdPostId } =
      await this.commandBus.execute(command)
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
