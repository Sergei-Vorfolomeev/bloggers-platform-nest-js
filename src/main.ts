import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './infrastructure/exception-filters/http-exception.filter'
import { FieldErrorType } from './base/types'
import cookieParser from 'cookie-parser'
import { useContainer } from 'class-validator'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  useContainer(app.select(AppModule), { fallbackOnErrors: true })
  app.enableCors()
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorsMessages: FieldErrorType[] = []
        errors.forEach((el) => {
          const constraintsKeys = Object.keys(el.constraints!)
          constraintsKeys.forEach((ckey) => {
            errorsMessages.push({
              field: el.property,
              message: el.constraints![ckey],
            })
          })
        })
        throw new BadRequestException(errorsMessages)
      },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(3000)
}

bootstrap()
