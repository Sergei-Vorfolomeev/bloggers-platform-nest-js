import { IsNotEmpty, Length } from 'class-validator'

export class LoginInputModel {
  @Length(3, 30)
  @IsNotEmpty()
  loginOrEmail: string

  @IsNotEmpty()
  password: string
}
