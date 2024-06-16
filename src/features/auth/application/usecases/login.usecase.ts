import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { TokensPayload } from '../types'
import { ObjectId } from 'mongodb'
import { DeviceDBModel } from '../../../devices/domain/types'
import { add } from 'date-fns/add'
import { UsersRepository } from '../../../users/infrastructure/users.repository'
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository'
import { BcryptAdapter } from '../../../../base/adapters/bcrypt.adapter'
import { JwtAdapter } from '../../../../base/adapters/jwt.adapter'

export class LoginCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public deviceName: string,
    public clientIp: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<InterLayerObject<TokensPayload>> {
    const { loginOrEmail, password, deviceName, clientIp } = command
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
        seconds: 120,
      }).toISOString(),
    }
    await this.devicesRepository.addNewDevice(newDevice)
    return new InterLayerObject(StatusCode.Success, null, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  }
}
