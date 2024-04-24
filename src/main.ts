import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyAppSettings } from './settings/apply-app-settings'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './settings/configuration'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // resolve env variables
  const configService = app.get(ConfigService<ConfigType, true>)
  const port = configService.get('port', { infer: true })
  const env = configService.get('env', { infer: true })
  // apply all middlewares, guards, interceptors, pipes, exception filter
  applyAppSettings(app)
  await app.listen(port)

  console.log(`Nest App has been started at ${port} port`)
  console.log(`Environment: ${env}`)
}

bootstrap()
