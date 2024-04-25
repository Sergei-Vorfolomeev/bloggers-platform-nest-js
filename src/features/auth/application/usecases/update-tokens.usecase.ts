import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { TokensPayload } from '../types'
import { DeviceDBModel } from '../../../devices/domain/types'
import { add } from 'date-fns/add'
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository'
import { JwtAdapter } from '../../../../base/adapters/jwt.adapter'

export class UpdateTokensCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(UpdateTokensCommand)
export class UpdateTokensUseCase implements ICommandHandler {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(
    command: UpdateTokensCommand,
  ): Promise<InterLayerObject<TokensPayload>> {
    const payload = await this.jwtAdapter.verifyRefreshToken(
      command.refreshToken,
    )
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
}
