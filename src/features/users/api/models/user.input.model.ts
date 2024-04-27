import { QueryParams } from '../../../../base/types'
import { IsEmail, Length, Matches } from 'class-validator'
import { isValidString } from '../../../../infrastructure/decorators/validators/is-valid-string.decorator'

export type UsersQueryParams = {
  searchLoginTerm?: string
  searchEmailTerm?: string
} & QueryParams

export class UserInputModel {
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @isValidString()
  login: string

  @IsEmail()
  @isValidString()
  email: string

  @Length(6, 20)
  @isValidString()
  password: string
}

export type UserAttachedInRequest = {
  id: string
}
