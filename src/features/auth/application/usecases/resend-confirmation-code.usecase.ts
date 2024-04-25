import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { randomUUID } from 'crypto'
import { templateForRegistration } from '../../../../base/utils/template-for-registration'
import { UsersRepository } from '../../../users/infrastructure/users.repository'
import { EmailAdapter } from '../../../../base/adapters/email.adapter'

export class ResendConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute(
    command: ResendConfirmationCodeCommand,
  ): Promise<InterLayerObject> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    )
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
      command.email,
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
}
