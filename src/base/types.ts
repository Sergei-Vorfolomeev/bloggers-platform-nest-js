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
