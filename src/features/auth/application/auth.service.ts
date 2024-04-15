import { Injectable } from '@nestjs/common'
import {
  ErrorsMessages,
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../base/interlayer-object'
import { TokensPayload } from './types'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter'
import { ObjectId } from 'mongodb'
import { JwtAdapter } from '../../../base/adapters/jwt.adapter'
import { randomUUID } from 'crypto'
import { UserDBModel } from '../../users/domain/types'
import { add } from 'date-fns/add'
import { EmailAdapter } from '../../../base/adapters/email.adapter'
import { templateForRegistration } from '../../../base/utils/template-for-registration'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly jwtAdapter: JwtAdapter,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async login(
    loginOrEmail: string,
    password: string,
    deviceName: string,
    clientIp: string,
  ): Promise<InterLayerObject<TokensPayload>> {
    const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail)
    if (!user) {
      return new InterLayerObject(
        StatusCode.Unauthorized,
        new ErrorsMessages(
          new FieldError(
            'login, email, password',
            'Login, email or password is incorrect',
          ),
        ),
      )
    }
    const isMatched = await this.bcryptAdapter.comparePasswords(
      password,
      user.password,
    )
    if (!isMatched) {
      return new InterLayerObject(
        StatusCode.Unauthorized,
        new ErrorsMessages(
          new FieldError(
            'login, email, password',
            'Login, email or password is incorrect',
          ),
        ),
      )
    }
    const deviceId = new ObjectId()
    const tokens = await this.jwtAdapter.generateTokens(
      user,
      deviceId.toString(),
    )
    if (!tokens) {
      return new InterLayerObject(
        StatusCode.ServerError,
        'Error with generating or saving tokens',
      )
    }
    // const newDevice: DeviceDBModel = {
    //   _id: deviceId,
    //   userId: user._id.toString(),
    //   ip: clientIp,
    //   title: deviceName,
    //   creationDate: new Date().toISOString(),
    //   refreshToken: tokens.encryptedRefreshToken,
    //   lastActiveDate: new Date().toISOString(),
    //   expirationDate: add(new Date(), {
    //     seconds: 20,
    //   }).toISOString(),
    // }
    // await this.devicesRepository.addNewDevice(newDevice)
    return new InterLayerObject(StatusCode.Success, null, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  }

  async registerUser(
    login: string,
    email: string,
    password: string,
  ): Promise<InterLayerObject> {
    const userByLogin = await this.usersRepository.findUserByLoginOrEmail(login)
    if (userByLogin) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        'User with provided login already exists',
      )
    }
    const userByEmail = await this.usersRepository.findUserByLoginOrEmail(email)
    if (userByEmail) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        'User with provided email already exists',
      )
    }
    const hashedPassword = await this.bcryptAdapter.generateHash(password)
    if (!hashedPassword) {
      return new InterLayerObject(
        StatusCode.ServerError,
        'Error with hashing password',
      )
    }
    const newUser: UserDBModel = {
      login,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 30,
        }),
        isConfirmed: false,
      },
    }
    const userId = await this.usersRepository.createUser(newUser)
    if (!userId) {
      return new InterLayerObject(
        StatusCode.ServerError,
        'Error with creating user in db',
      )
    }
    const info = await this.emailAdapter.sendEmail(
      email,
      'Confirm your email',
      templateForRegistration(newUser.emailConfirmation.confirmationCode),
    )
    if (!info) {
      return new InterLayerObject(
        StatusCode.ServerError,
        'Error with sending email',
      )
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
