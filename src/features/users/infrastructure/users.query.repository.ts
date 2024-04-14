import { Injectable } from '@nestjs/common'
import { UserDBModel, UsersSortParams } from '../domain/types'
import { Paginator } from '../../../base/types'
import { UserOutputModel } from '../api/models/user.output.model'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from '../domain/user.entity'
import { Model } from 'mongoose'
import { ObjectId, WithId } from 'mongodb'

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getUsers(
    sortParams: UsersSortParams,
  ): Promise<Paginator<UserOutputModel[]> | null> {
    try {
      const {
        searchLoginTerm,
        searchEmailTerm,
        sortBy,
        sortDirection,
        pageSize,
        pageNumber,
      } = sortParams
      const filter: Record<string, any> = {}
      if (searchLoginTerm) {
        filter.$or = [{ login: { $regex: searchLoginTerm, $options: 'i' } }]
      }
      if (searchEmailTerm) {
        if (filter.$or) {
          filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } })
        } else {
          filter.$or = [{ email: { $regex: searchEmailTerm, $options: 'i' } }]
        }
      }
      const totalCount = await this.userModel.countDocuments(filter)
      const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
      const users = await this.userModel
        .find(filter)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortBy]: sortDirection })
        .lean()
        .exec()
      return {
        items: users.map(this.mapToView),
        page: pageNumber,
        pageSize,
        pagesCount,
        totalCount,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getUserById(id: string): Promise<UserOutputModel | null> {
    const user = await this.userModel.findById(new ObjectId(id)).lean().exec()
    if (!user) {
      return null
    }
    return this.mapToView(user)
  }

  private mapToView(user: WithId<UserDBModel>): UserOutputModel {
    return {
      id: user._id.toString(),
      email: user.email,
      login: user.login,
      createdAt: user.createdAt,
    }
  }
}
