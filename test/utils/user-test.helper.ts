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

  async loginUserWithUserAgent(
    httpServer: any,
    loginOrEmail: string,
    password: string,
    userAgent: string,
  ) {
    const res = await request(httpServer)
      .post(`${PATHS.auth}/login`)
      .set('User-Agent', userAgent)
      .send({
        loginOrEmail,
        password,
      })
      .expect(200)

    const cookieHeader = res.headers['set-cookie']
    const refreshToken = cookieHeader[0].split(';')[0].split('=')[1]
    expect(refreshToken).toEqual(expect.any(String))
    expect(refreshToken).toContain('.')
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.accessToken).toContain('.')

    return { accessToken: res.body.accessToken, refreshToken }
  }
}
