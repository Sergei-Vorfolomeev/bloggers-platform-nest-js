import request from 'supertest'
import { PATHS } from '../../src/base/const/paths'
import { ConfigService } from '@nestjs/config'

export class UsersTestHelper {
  private readonly adminLogin: string
  private readonly adminPassword: string

  constructor(private readonly configService: ConfigService) {
    this.adminLogin = this.configService.get('basicAuth.BASIC_LOGIN', '')
    this.adminPassword = this.configService.get('basicAuth.BASIC_PASSWORD', '')
  }

  async createUser(httpServer: any) {
    const res = await request(httpServer)
      .post(PATHS.users)
      .auth(this.adminLogin, this.adminPassword)
      .send({
        login: 'test-login',
        email: 'test@gmail.com',
        password: 'test-pass',
      })
      .expect(201)
    return res.body
  }

  async createManyUsers(httpServer: any, count: number) {
    const users = []
    for (let i = 0; i < count; i++) {
      try {
        const res = await request(httpServer)
          .post(PATHS.users)
          .auth(this.adminLogin, this.adminPassword)
          .send({
            login: `test-${i}`,
            email: `test-${i}-@gmail.com`,
            password: `test-pass`,
          })
          .expect(201)
        users.push(res.body)
      } catch (e) {
        console.error(e)
      }
    }
    return users.reverse()
  }
}
