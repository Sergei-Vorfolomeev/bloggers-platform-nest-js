import { Injectable } from '@nestjs/common'
import { UserDBModel } from '../domain/types'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../domain/user.entity'
import { ObjectId } from 'mongodb'

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    try {
      return this.userModel
        .findOne()
        .or([{ login: loginOrEmail }, { email: loginOrEmail }])
        .exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async createUser(user: UserDBModel): Promise<string | null> {
    try {
      const newUser = new this.userModel(user)
      await newUser.save()
      return newUser._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await this.userModel.deleteOne({ _id: new ObjectId(id) })
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
