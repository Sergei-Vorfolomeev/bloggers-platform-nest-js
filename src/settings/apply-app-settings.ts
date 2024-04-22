import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { useContainer } from 'class-validator'
import { AppModule } from '../app.module'
import cookieParser from 'cookie-parser'
import { FieldErrorType } from '../base/types'
import { HttpExceptionFilter } from '../infrastructure/exception-filters/http-exception.filter'

const APP_PREFIX = '/api'

export const applyAppSettings = (app: INestApplication) => {
  // Для внедрения зависимостей в validator constraint
  // {fallbackOnErrors: true} требуется, поскольку Nest генерирует исключение,
  // когда DI не имеет необходимого класса.
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // применить глобально middleware
  // app.use(middleware)

  app.enableCors()
  app.use(cookieParser())

  setAppPrefix(app)

  // Конфигурация swagger документации
  // setSwagger(app)

  setAppPipes(app)
  setAppExceptionFilters(app)
}

const setAppPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(APP_PREFIX)
}

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorsMessages: FieldErrorType[] = []
        errors.forEach((el) => {
          const constraintsKeys = Object.keys(el.constraints!)
          constraintsKeys.forEach((key) => {
            errorsMessages.push({
              field: el.property,
              message: el.constraints![key],
            })
          })
        })
        throw new BadRequestException(errorsMessages)
      },
    }),
  )
}

const setAppExceptionFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter())
}

// const setSwagger = (app: INestApplication) => {
//   if (!appSettings.env.isProduction()) {
//     const swaggerPath = APP_PREFIX + '/swagger-doc'
//
//     const config = new DocumentBuilder()
//       .setTitle('BLOGGER API')
//       .addBearerAuth()
//       .setVersion('1.0')
//       .build()
//
//     const document = SwaggerModule.createDocument(app, config)
//     SwaggerModule.setup(swaggerPath, app, document, {
//       customSiteTitle: 'Blogger Swagger',
//     })
//   }
// }
