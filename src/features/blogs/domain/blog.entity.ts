import { HydratedDocument, Model } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type BlogDocument = HydratedDocument<Blog>
export type BlogModel = Model<BlogDocument>

@Schema()
export class Blog {
  @Prop({
    required: true,
  })
  name: string

  @Prop({
    required: true,
  })
  description: string

  @Prop({
    required: true,
  })
  websiteUrl: string

  @Prop({
    required: true,
  })
  createdAt: string

  @Prop({
    required: true,
  })
  isMembership: boolean
}

export const BlogSchema = SchemaFactory.createForClass(Blog)
