import { QueryParams } from '../../../../base/types'
import { IsUrl, MaxLength } from 'class-validator'
import { isValidString } from '../../../../base/decorators/is-valid-string.decorator'

export type BlogsQueryParams = {
  searchNameTerm?: string
} & QueryParams

export class BlogInputModel {
  @MaxLength(15)
  @isValidString()
  name: string

  @MaxLength(500)
  @isValidString()
  description: string

  @MaxLength(100)
  @IsUrl()
  @isValidString()
  websiteUrl: string
}
