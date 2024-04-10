import { SortParams } from '../../../base/types'

export type BlogSortParams = {
  searchNameTerm: string | null
} & SortParams

export type BlogDBModel = {
  name: string
  description: string
  websiteUrl: string
  createdAt: string
  isMembership: boolean
}
