export type QueryParams = {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  pageNumber?: number
  pageSize?: number
}

export type SortParams = {
  sortBy: string
  sortDirection: 'asc' | 'desc'
  pageNumber: number
  pageSize: number
}

export type Paginator<T> = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: T
}

export type FieldErrorType = {
  message: string
  field: string
}

export type APIErrorResult = {
  errorsMessages: FieldErrorType[]
}
