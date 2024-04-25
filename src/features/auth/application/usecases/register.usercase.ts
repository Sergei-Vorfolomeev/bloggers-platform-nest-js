import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  FieldError,
  InterLayerObject,
  StatusCode,
} from '../../../../base/interlayer-object'
import { UserDBModel } from '../../../users/domain/types'
import { randomUUID } from 'crypto'
import { add } from 'date-fns/add'
import { templateForRegistration } from '../../../../base/utils/template-for-registration'
import { UsersRepository } from '../../../users/infrastructure/users.repository'
import { BcryptAdapter } from '../../../../base/adapters/bcrypt.adapter'
import { EmailAdapter } from '../../../../base/adapters/email.adapter'

export class RegisterUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserCase implements ICommandHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute(command: RegisterUserCommand): Promise<InterLayerObject> {
    const { login, email, password } = command
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
}
