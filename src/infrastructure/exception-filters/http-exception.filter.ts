import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const errors: any = exception.getResponse()
    if (status === 400) {
      response.status(status).json({
        errorsMessages: errors.message,
      })
    }
    if (status === 401) {
      response.status(status).json({
        status: status,
        message: exception.message,
      })
    } else {
      response.status(status).json(exception)
    }
  }
}
