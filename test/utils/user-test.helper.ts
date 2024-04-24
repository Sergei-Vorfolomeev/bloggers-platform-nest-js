import request from 'supertest'
import { PATHS } from '../../src/base/const/paths'

export class UserTestHelper {
  private readonly credentials: string

  constructor(credentials: string) {
    this.credentials = credentials
  }

  async createUser(httpServer: any) {
    const res = await request(httpServer)
      .post(PATHS.users)
      .set('Authorization', `Basic ${this.credentials}`)
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
          .set('Authorization', `Basic ${this.credentials}`)
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
