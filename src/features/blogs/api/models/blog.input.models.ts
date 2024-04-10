export type BlogsQueryParams = {
  searchNameTerm?: string
} & QueryParams

export type QueryParams = {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  pageNumber?: number
  pageSize?: number
}
