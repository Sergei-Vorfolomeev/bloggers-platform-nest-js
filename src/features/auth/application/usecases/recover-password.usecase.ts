import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { randomUUID } from 'crypto'
import { templateForPasswordRecovery } from '../../../../base/utils/template-for-password-recovery'
import { UsersRepository } from '../../../users/infrastructure/users.repository'
import { EmailAdapter } from '../../../../base/adapters/email.adapter'

export class RecoverPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase implements ICommandHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute(command: RecoverPasswordCommand): Promise<InterLayerObject> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    )
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
      command.email,
      'Password recovery',
      templateForPasswordRecovery(recoveryCode),
    )
    if (!isSent) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }
}
