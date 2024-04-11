export class InterLayerObject<T = null> {
  statusCode: StatusCode
  errorsMessages: ErrorsMessages | string | null | undefined
  data: T | undefined

  constructor(
    statusCode: StatusCode,
    errorsMessages?: ErrorsMessages | string | null,
    data?: T,
  ) {
    this.statusCode = statusCode
    this.errorsMessages = errorsMessages
    this.data = data
  }
}

export class ErrorsMessages {
  public errorsMessages: FieldErrorType[]

  constructor(...data: FieldErrorType[]) {
    this.errorsMessages = [...data]
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

export type FieldErrorType = {
  message: string
  field: string
}
