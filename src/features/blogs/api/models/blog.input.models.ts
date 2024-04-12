import { QueryParams } from '../../../../base/types'
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator'

export type BlogsQueryParams = {
  searchNameTerm?: string
} & QueryParams

export class BlogInputModel {
  @MaxLength(15)
  @IsString()
  @IsNotEmpty()
  name: string

  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  description: string

  @MaxLength(100)
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  websiteUrl: string
}
