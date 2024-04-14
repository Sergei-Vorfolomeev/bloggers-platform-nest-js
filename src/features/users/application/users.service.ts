import { Injectable } from '@nestjs/common'
import { InterLayerObject, StatusCode } from '../../../base/interlayer-object'
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter'
import { UserDBModel } from '../domain/types'
import { UsersRepository } from '../infrastructure/users.repository'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {}

  async createUser(
    login: string,
    email: string,
    password: string,
  ): Promise<InterLayerObject<string>> {
    const hashedPassword = await this.bcryptAdapter.generateHash(password)
    if (!hashedPassword) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    const newUser: UserDBModel = {
      login,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true,
      },
    }
    const createdUserId = await this.usersRepository.createUser(newUser)
    if (!createdUserId) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.Created, null, createdUserId)
  }

  async deleteUser(userId: string): Promise<InterLayerObject> {
    const isDeleted = await this.usersRepository.deleteUser(userId)
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
