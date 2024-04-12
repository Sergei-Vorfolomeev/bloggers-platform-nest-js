import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'
import { ValidationError } from 'class-validator'

interface CustomValidationError {
  property: string
  constraints: { [type: string]: string }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const errors = exception.getResponse()
    response.status(status).json({
      errorsMessages: errors,
    })
  }
}
