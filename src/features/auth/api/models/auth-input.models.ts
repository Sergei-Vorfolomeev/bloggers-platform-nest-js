import { IsEmail, Length } from 'class-validator'
import { isValidString } from '../../../../infrastructure/decorators/is-valid-string.decorator'

export class LoginInputModel {
  @Length(3, 30)
  @isValidString()
  loginOrEmail: string

  @isValidString()
  password: string
}

export class RegistrationConfirmationCodeModel {
  @isValidString()
  code: string
}

export class RegistrationEmailResendingModel {
  @IsEmail()
  @isValidString()
  email: string
}

export class PasswordRecoveryInputModel {
  @IsEmail()
  @isValidString()
  email: string
}

export class NewPasswordRecoveryInputModel {
  @isValidString()
  newPassword: string

  @isValidString()
  recoveryCode: string
}
