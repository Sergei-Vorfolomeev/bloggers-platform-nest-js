import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyAppSettings } from './settings/apply-app-settings'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // resolve env variables
  const configService = app.get(ConfigService)
  const port = configService.get<number>('port', { infer: true })
  const env = configService.get<string>('env')
  // apply all middlewares, guards, interceptors, pipes, exception filter
  applyAppSettings(app)
  await app.listen(port)

  console.log(`Nest App has been started at ${port} port`)
  console.log(`Environment: ${env}`)
}

bootstrap()
