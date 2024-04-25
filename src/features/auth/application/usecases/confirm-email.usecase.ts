import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { UsersRepository } from '../../../users/infrastructure/users.repository'

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<InterLayerObject> {
    const user = await this.usersRepository.findByConfirmationCode(command.code)
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
}
