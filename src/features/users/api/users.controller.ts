import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { UsersQueryRepository } from '../infrastructure/users.query.repository'
import { Paginator } from '../../../base/types'
import { UserOutputModel } from './models/user.output.model'
import { UserInputModel, UsersQueryParams } from './models/user.input.model'
import { ObjectId } from 'mongodb'
import { StatusCode } from '../../../base/interlayer-object'
import { UsersService } from '../application/users.service'
import { handleExceptions } from '../../../base/utils/handle-exceptions'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getUsers(
    @Query() query: UsersQueryParams,
  ): Promise<Paginator<UserOutputModel[]>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
    } = query
    const sortParams = {
      searchLoginTerm: searchLoginTerm ?? null,
      searchEmailTerm: searchEmailTerm ?? null,
      sortBy: sortBy ?? 'createdAt',
      sortDirection: sortDirection ?? 'desc',
      pageSize: pageSize ? +pageSize : 10,
      pageNumber: pageNumber ? +pageNumber : 1,
    }
    const users = await this.usersQueryRepository.getUsers(sortParams)
    if (!users) {
      throw new InternalServerErrorException()
    }
    return users
  }

  @Get(':id')
  async getUserById(@Param('id') userId: string): Promise<UserOutputModel> {
    if (!ObjectId.isValid(userId)) {
      throw new NotFoundException()
    }
    const user = await this.usersQueryRepository.getUserById(userId)
    if (!user) {
      throw new NotFoundException()
    }
    return user
  }

  @Post()
  async createUser(@Body() body: UserInputModel): Promise<UserOutputModel> {
    const { login, email, password } = body
    const { statusCode, data: createdUserId } =
      await this.usersService.createUser(login, email, password)
    handleExceptions(statusCode)
    const createdUser = await this.usersQueryRepository.getUserById(
      createdUserId!,
    )
    if (!createdUser) {
      throw new BadRequestException()
    }
    return createdUser
  }
}
