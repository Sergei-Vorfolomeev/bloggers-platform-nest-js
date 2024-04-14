import { SortParams } from '../../../base/types'

export type UserDBModel = {
  email: string
  login: string
  password: string
  createdAt: string
  emailConfirmation: EmailConfirmationType
  passwordRecovery?: {
    recoveryCode: string
  }
}

export class EmailConfirmationType {
  confirmationCode: string
  expirationDate: Date
  isConfirmed: boolean
}

export type UsersSortParams = {
  searchLoginTerm: string | null
  searchEmailTerm: string | null
} & SortParams
