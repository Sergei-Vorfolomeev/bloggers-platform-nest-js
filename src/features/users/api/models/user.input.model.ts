import { QueryParams } from '../../../../base/types'
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export type UsersQueryParams = {
  searchLoginTerm?: string
  searchEmailTerm?: string
} & QueryParams

export class UserInputModel {
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @IsString()
  @IsNotEmpty()
  login: string

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string

  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  password: string
}
