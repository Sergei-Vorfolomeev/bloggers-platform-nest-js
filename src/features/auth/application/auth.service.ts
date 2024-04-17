import { Injectable } from '@nestjs/common'
import {
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
import { DeviceDBModel } from '../../devices/domain/types'
import { DevicesRepository } from '../../devices/infrastructure/devices.repository'
import { templateForPasswordRecovery } from '../../../base/utils/template-for-password-recovery'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly jwtAdapter: JwtAdapter,
    private readonly emailAdapter: EmailAdapter,
    private readonly devicesRepository: DevicesRepository,
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
        new FieldError(
          'login, email, password',
          'Login, email or password is incorrect',
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
        new FieldError(
          'login, email, password',
          'Login, email or password is incorrect',
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
    const newDevice: DeviceDBModel = {
      _id: deviceId,
      userId: user._id.toString(),
      ip: clientIp,
      title: deviceName,
      creationDate: new Date().toISOString(),
      refreshToken: tokens.encryptedRefreshToken,
      lastActiveDate: new Date().toISOString(),
      expirationDate: add(new Date(), {
        seconds: 20,
      }).toISOString(),
    }
    await this.devicesRepository.addNewDevice(newDevice)
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
        new FieldError('login', 'User with provided login already exists'),
      )
    }
    const userByEmail = await this.usersRepository.findUserByLoginOrEmail(email)
    if (userByEmail) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('email', 'User with provided email already exists'),
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

  async confirmEmailByCode(code: string): Promise<InterLayerObject> {
    const user = await this.usersRepository.findByConfirmationCode(code)
    if (!user) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('code', 'Confirmation code is incorrect'),
      )
    }
    if (user.emailConfirmation.isConfirmed) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('code', 'Confirmation code is already been applied'),
      )
    }
    if (new Date() > user.emailConfirmation.expirationDate) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('code', 'Confirmation code is expired'),
      )
    }
    const isUpdated = await this.usersRepository.confirmEmail(user._id)
    if (!isUpdated) {
      return new InterLayerObject(
        StatusCode.ServerError,
        new FieldError('code', "Confirmation code wasn't updated"),
      )
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async resendConfirmationCode(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email)
    if (!user) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('email', 'Email is incorrect'),
      )
    }
    if (user.emailConfirmation.isConfirmed) {
      return new InterLayerObject(
        StatusCode.BadRequest,
        new FieldError('email', 'Email is already confirmed'),
      )
    }
    const newCode = randomUUID()
    const info = await this.emailAdapter.sendEmail(
      email,
      'Confirm your email',
      templateForRegistration(newCode),
    )
    if (!info) {
      return new InterLayerObject(
        StatusCode.ServerError,
        new FieldError('email', 'Error with sending email'),
      )
    }
    const isUpdated = await this.usersRepository.updateConfirmationCode(
      user._id,
      newCode,
    )
    if (!isUpdated) {
      return new InterLayerObject(
        StatusCode.ServerError,
        new FieldError('code', "Confirmation code wasn't updated"),
      )
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async logout(refreshToken: string): Promise<InterLayerObject> {
    const payload = await this.jwtAdapter.verifyRefreshToken(refreshToken)
    if (!payload) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const isDeleted = await this.devicesRepository.deleteDevice(
      payload.device._id.toString(),
    )
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async updateTokens(
    refreshToken: string,
  ): Promise<InterLayerObject<TokensPayload>> {
    const payload = await this.jwtAdapter.verifyRefreshToken(refreshToken)
    if (!payload) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const { user, device } = payload
    const tokens = await this.jwtAdapter.generateTokens(
      user,
      device._id.toString(),
    )
    if (!tokens) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    const deviceWithNewRefreshToken: DeviceDBModel = {
      ...device,
      refreshToken: tokens.encryptedRefreshToken,
      lastActiveDate: new Date().toISOString(),
      expirationDate: add(new Date(), {
        seconds: 20,
      }).toISOString(),
    }
    const isUpdated = await this.devicesRepository.updateRefreshToken(
      deviceWithNewRefreshToken,
    )
    if (!isUpdated) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.Success, null, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  }

  async recoverPassword(email: string): Promise<InterLayerObject> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email)
    if (!user) {
      return new InterLayerObject(StatusCode.NoContent)
    }
    const recoveryCode = randomUUID()
    const isAdded = await this.usersRepository.addRecoveryCode(
      user._id,
      recoveryCode,
    )
    if (!isAdded) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    const isSent = await this.emailAdapter.sendEmail(
      email,
      'Password recovery',
      templateForPasswordRecovery(recoveryCode),
    )
    if (!isSent) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async updatePassword(
    recoveryCode: string,
    newPassword: string,
  ): Promise<InterLayerObject> {
    const user = await this.usersRepository.findUserByRecoveryCode(recoveryCode)
    if (!user) {
      return new InterLayerObject(StatusCode.BadRequest)
    }
    const hashedPassword = await this.bcryptAdapter.generateHash(newPassword)
    if (!hashedPassword) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    const isUpdated = await this.usersRepository.updatePassword(
      user._id,
      hashedPassword,
    )
    if (!isUpdated) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
