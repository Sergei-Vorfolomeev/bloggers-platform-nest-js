import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class LoginInputModel {
  @Length(3, 30)
  @IsNotEmpty()
  loginOrEmail: string

  @IsNotEmpty()
  password: string
}

export class RegistrationConfirmationCodeModel {
  @IsString()
  @IsNotEmpty()
  code: string
}

export class RegistrationEmailResendingModel {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string
}

export class PasswordRecoveryInputModel {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string
}

export class NewPasswordRecoveryInputModel {
  @IsString()
  @IsNotEmpty()
  newPassword: string

  @IsString()
  @IsNotEmpty()
  recoveryCode: string
}
