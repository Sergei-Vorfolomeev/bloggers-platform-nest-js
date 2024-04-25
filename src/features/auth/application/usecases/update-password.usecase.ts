import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { UsersRepository } from '../../../users/infrastructure/users.repository'
import { BcryptAdapter } from '../../../../base/adapters/bcrypt.adapter'

export class UpdatePasswordCommand {
  constructor(
    public recoveryCode: string,
    public newPassword: string,
  ) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase implements ICommandHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<InterLayerObject> {
    const { recoveryCode, newPassword } = command
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
