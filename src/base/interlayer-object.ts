export class InterLayerObject<T = null> {
  statusCode: StatusCode
  error: FieldError[] | string | null | undefined
  data: T | undefined

  constructor(
    statusCode: StatusCode,
    error?: FieldError | string | null,
    data?: T,
  ) {
    this.statusCode = statusCode
    this.error = error instanceof FieldError ? [error] : error
    this.data = data
  }
}

export class FieldError {
  public field: string
  public message: string

  constructor(field: string, message: string) {
    this.field = field
    this.message = message
  }
}

export enum StatusCode {
  Success,
  Created,
  NoContent,
  Unauthorized,
  Forbidden,
  BadRequest,
  NotFound,
  ServerError,
}
