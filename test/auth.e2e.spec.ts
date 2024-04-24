import { INestApplication } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { initTestSettings } from './utils/init-test.settings'
import request from 'supertest'
import { PATHS } from '../src/base/const/paths'
import { UserTestHelper } from './utils/user-test.helper'
import { UsersRepository } from '../src/features/users/infrastructure/users.repository'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let mongoServer: MongoMemoryServer
  let httpServer: any
  const userTestHelper = new UserTestHelper()

  beforeAll(async () => {
    const res = await initTestSettings()
    app = res.app
    httpServer = res.httpServer
  })

  afterAll(async () => {
    await request(httpServer).delete(PATHS.__test__).expect(204)
    await app.close()
    await mongoServer.stop()
  })

  it('register user', async () => {
    await request(httpServer)
      .post(`${PATHS.auth}/registration`)
      .send({
        login: 'test-login',
        email: 'email@gmail.com',
        password: 'test-pass',
      })
      .expect(204)
  })

  let user: any = null
  it('get registered user', async () => {
    const res = await request(httpServer).get(PATHS.users).expect(200)

    user = res.body.items[0]

    expect(user).toEqual({
      id: expect.any(String),
      login: 'test-login',
      email: 'email@gmail.com',
      createdAt: expect.any(String),
    })
  })

  it("shouldn't create user twice", async () => {
    await request(httpServer)
      .post(`${PATHS.auth}/registration`)
      .send({
        login: 'test-login',
        email: 'email@gmail.com',
        password: 'test-pass',
      })
      .expect(400, {
        errorsMessages: [
          {
            message: 'User with provided login already exists',
            field: 'login',
          },
        ],
      })
  })

  let validRefreshToken: any = null
  let inValidRefreshToken: any = null
  it('login user', async () => {
    const res = await request(httpServer)
      .post(`${PATHS.auth}/login`)
      .send({
        loginOrEmail: 'email@gmail.com',
        password: 'test-pass',
      })
      .expect(200)

    const cookieHeader = res.headers['set-cookie']
    validRefreshToken = cookieHeader[0].split(';')[0].split('=')[1]
    expect(validRefreshToken).toEqual(expect.any(String))
    expect(validRefreshToken).toContain('.')
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.accessToken).toContain('.')
  })

  it('refresh all tokens', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1)
      }, 1000)
    })

    const res = await request(httpServer)
      .post(`${PATHS.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${validRefreshToken}`)
      .expect(200)

    inValidRefreshToken = validRefreshToken
    const cookieHeader = res.headers['set-cookie']
    validRefreshToken = cookieHeader[0].split(';')[0].split('=')[1]
    expect(validRefreshToken).toEqual(expect.any(String))
    expect(validRefreshToken).toContain('.')
    expect(validRefreshToken).not.toBe(inValidRefreshToken)
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.accessToken).toContain('.')
  })

  it('refresh all tokens with invalid refresh token', async () => {
    await request(httpServer)
      .post(`${PATHS.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${inValidRefreshToken}`)
      .expect(401)
  })

  it('logout', async () => {
    await request(httpServer)
      .post(`${PATHS.auth}/logout`)
      .set('Cookie', `refreshToken=${validRefreshToken}`)
      .expect(204)
  })

  it('try to refresh tokens after logout', async () => {
    await request(httpServer)
      .post(`${PATHS.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${validRefreshToken}`)
      .expect(401)
  })

  describe('recover password', () => {
    let user: any = null
    let recoveryCode: any = null

    it('successful request to change password', async () => {
      const { email } = await userTestHelper.registerUser(httpServer)
      await request(httpServer)
        .post(`${PATHS.auth}/password-recovery`)
        .send({
          email,
        })
        .expect(204)

      const usersRepository = app.get(UsersRepository)
      user = await usersRepository.findUserByLoginOrEmail(email)
      recoveryCode = user.passwordRecovery.recoveryCode
    })

    it('successful update password', async () => {
      await request(httpServer)
        .post(`${PATHS.auth}/new-password`)
        .send({
          recoveryCode,
          newPassword: 'newPassword',
        })
        .expect(204)
    })

    it('login using new password', async () => {
      await request(httpServer)
        .post(`${PATHS.auth}/login`)
        .send({
          loginOrEmail: user.email,
          password: 'newPassword',
        })
        .expect(200)
    })

    it('login using old password', async () => {
      await request(httpServer)
        .post(`${PATHS.auth}/login`)
        .send({
          loginOrEmail: user.email,
          password: 'test-pass',
        })
        .expect(401)
    })
  })

  describe('test rate limit', () => {
    let user: any = null

    it('try to login many times', async () => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(1)
        }, 10000)
      })

      user = await userTestHelper.registerUser(httpServer)
      for (let i = 0; i < 5; i++) {
        await request(httpServer)
          .post(`${PATHS.auth}/login`)
          .send({
            loginOrEmail: user.email,
            password: `pass${i}`,
          })
          .expect(401)
      }
    })

    it('get 429 status - too many requests', async () => {
      for (let i = 0; i < 5; i++) {
        await request(httpServer)
          .post(`${PATHS.auth}/login`)
          .send({
            loginOrEmail: user.email,
            password: `pass$`,
          })
          .expect(429)
      }

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(1)
        }, 10000)
      })
    })

    it('401 after 10 sec', async () => {
      await request(httpServer)
        .post(`${PATHS.auth}/login`)
        .send({
          loginOrEmail: user.email,
          password: `pass$`,
        })
        .expect(401)
    })
  })
})
