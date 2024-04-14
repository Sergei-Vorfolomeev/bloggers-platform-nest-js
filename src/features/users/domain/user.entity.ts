import { HydratedDocument } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { EmailConfirmationType } from './types'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @Prop({
    required: true,
  })
  email: string

  @Prop({
    required: true,
  })
  login: string

  @Prop({
    required: true,
  })
  password: string

  @Prop({
    required: true,
  })
  createdAt: string

  @Prop({
    type: EmailConfirmationType,
    required: true,
  })
  emailConfirmation: {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean
  }

  @Prop({
    type: {
      recoveryCode: String,
    },
  })
  passwordRecovery: {
    recoveryCode: string
  }
}

export const UserSchema = SchemaFactory.createForClass(User)
