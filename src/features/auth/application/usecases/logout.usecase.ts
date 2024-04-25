import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository'
import { JwtAdapter } from '../../../../base/adapters/jwt.adapter'

export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: LogoutCommand): Promise<InterLayerObject> {
    const payload = await this.jwtAdapter.verifyRefreshToken(
      command.refreshToken,
    )
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
}
