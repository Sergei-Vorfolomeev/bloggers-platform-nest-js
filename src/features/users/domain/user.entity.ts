import { HydratedDocument } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

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
    required: true,
  })
  emailConfirmation: {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean
  }

  @Prop()
  passwordRecovery: {
    recoveryCode: string
  }
}

export const UserSchema = SchemaFactory.createForClass(User)
