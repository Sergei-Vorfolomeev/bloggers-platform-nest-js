import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './infrastructure/exception-filters/http-exception.filter'
import { APIErrorResult } from './base/types'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        console.log(errors)
        throw new BadRequestException(errors)
      },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(3000)
}

bootstrap()
