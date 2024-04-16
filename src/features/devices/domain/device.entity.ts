import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model } from 'mongoose'

export type DeviceDocument = HydratedDocument<Device>
export type DeviceModel = Model<DeviceDocument>

export class Device {
  @Prop({
    required: true,
  })
  userId: string
  @Prop({
    required: true,
  })
  @Prop({
    required: true,
  })
  ip: string

  @Prop({
    required: true,
  })
  title: string

  @Prop({
    required: true,
  })
  creationDate: string

  @Prop({
    required: true,
  })
  refreshToken: string

  @Prop({
    required: true,
  })
  lastActiveDate: string

  @Prop({
    required: true,
  })
  expirationDate: string
}

export const DeviceSchema = SchemaFactory.createForClass(Device)
