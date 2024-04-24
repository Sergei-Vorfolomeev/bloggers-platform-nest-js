import request from 'supertest'
import { PATHS } from '../../src/base/const/paths'

export class UserTestHelper {
  async createUser(httpServer: any, credentials: string) {
    const res = await request(httpServer)
      .post(PATHS.users)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        login: 'test-login',
        email: 'test@gmail.com',
        password: 'test-pass',
      })
      .expect(201)
    return res.body
  }

  async createManyUsers(httpServer: any, count: number, credentials: string) {
    const users = []
    for (let i = 0; i < count; i++) {
      try {
        const res = await request(httpServer)
          .post(PATHS.users)
          .set('Authorization', `Basic ${credentials}`)
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

  async registerUser(httpServer: any) {
    const i = Math.ceil(Math.random() * 1000)
    await request(httpServer)
      .post(`${PATHS.auth}/registration`)
      .send({
        login: `login-${i}`,
        email: `email${i}@gmail.com`,
        password: 'test-pass',
      })
      .expect(204)
    return {
      login: `login-${i}`,
      email: `email${i}@gmail.com`,
      password: 'test-pass',
    }
  }
}
