import { QueryParams } from '../../../../base/types'

export type BlogsQueryParams = {
  searchNameTerm?: string
} & QueryParams

export type BlogInputModel = {
  name: string
  description: string
  websiteUrl: string
}
