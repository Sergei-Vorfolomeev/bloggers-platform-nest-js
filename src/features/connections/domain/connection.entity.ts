import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model } from 'mongoose'

export type ConnectionDocument = HydratedDocument<Connection>
export type ConnectionModel = Model<ConnectionDocument>

@Schema()
export class Connection {
  @Prop({
    required: true,
  })
  ip: string

  @Prop({
    required: true,
  })
  routePath: string

  @Prop({
    required: true,
  })
  createdAt: Date
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection)
