import { MongoMemoryServer } from 'mongodb-memory-server'
import process from 'process'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'
import { applyAppSettings } from '../../src/settings/apply-app-settings'
import { ConfigService } from '@nestjs/config'
import request from 'supertest'
import { PATHS } from '../../src/base/const/paths'
import { EmailAdapterMock } from '../mocks/email.adapter.mock'
import { EmailAdapter } from '../../src/base/adapters/email.adapter'

export const initTestSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const mongoServer = await MongoMemoryServer.create()
  process.env.MONGO_URL = mongoServer.getUri()

  const testingModuleBuilder = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailAdapter)
    .useClass(EmailAdapterMock)

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder)
  }

  const testingAppModule = await testingModuleBuilder.compile()
  const app = testingAppModule.createNestApplication()

  applyAppSettings(app)
  await app.init()

  const httpServer = app.getHttpServer()
  const configService = app.get(ConfigService)
  const env = configService.get<string>('env')
  console.log(`Environment: ${env}`)

  await request(httpServer).delete(PATHS.__test__).expect(204)

  return { app, httpServer }
}
