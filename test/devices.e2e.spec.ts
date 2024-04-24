import { INestApplication } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { initTestSettings } from './utils/init-test.settings'
import request from 'supertest'
import { PATHS } from '../src/base/const/paths'
import { UserTestHelper } from './utils/user-test.helper'

describe('DevicesController (e2e)', () => {
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

  let tokens1: any = null
  let tokens2: any = null
  let tokens3: any = null
  let tokens4: any = null
  let devices: any = null
  it('get all user devices', async () => {
    const user = await userTestHelper.registerUser(httpServer)
    tokens1 = await userTestHelper.loginUserWithUserAgent(
      httpServer,
      user.email,
      user.password,
      'Chrome',
    )
    tokens2 = await userTestHelper.loginUserWithUserAgent(
      httpServer,
      user.email,
      user.password,
      'Safari',
    )
    tokens3 = await userTestHelper.loginUserWithUserAgent(
      httpServer,
      user.email,
      user.password,
      'IPhone',
    )
    tokens4 = await userTestHelper.loginUserWithUserAgent(
      httpServer,
      user.email,
      user.password,
      'Android1',
    )

    const res = await request(httpServer)
      .get(PATHS.devices)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(200)

    devices = res.body

    expect(devices.length).toBe(4)
    expect(devices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deviceId: expect.any(String),
          title: expect.any(String),
          ip: expect.any(String),
          lastActiveDate: expect.stringMatching(
            /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
          ), // Строка в формате даты и времени
        }),
      ]),
    )

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1)
      }, 500)
    })
  })

  it('update refresh token of the first device', async () => {
    const res = await request(httpServer)
      .post(`${PATHS.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(200)

    const refreshToken = res.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1]
    expect(refreshToken).not.toBe(tokens1.refreshToken)
    expect(res.body.accessToken).not.toBe(tokens1.accessToken)
    expect(res.body).toEqual({
      accessToken: expect.any(String),
    })
    tokens1 = {
      accessToken: res.body.accessToken,
      refreshToken,
    }
  })

  it('get all devices with updated token', async () => {
    const res = await request(httpServer)
      .get(PATHS.devices)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(200)

    expect(res.body[0].lastActiveDate).not.toBe(devices[0].lastActiveDate)
    expect(res.body[1]).toEqual(devices[1])
    expect(res.body[2]).toEqual(devices[2])
    expect(res.body[3]).toEqual(devices[3])
    expect(res.body.length).toBe(4)

    devices = res.body
  })

  it('delete the second device', async () => {
    const secondDeviceId = devices[1].deviceId

    await request(httpServer)
      .delete(`${PATHS.devices}/${secondDeviceId}`)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(204)
  })

  it('get all devices without deleted device', async () => {
    const res = await request(httpServer)
      .get(PATHS.devices)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(200)

    expect(res.body.length).toBe(3)
    expect(res.body).toEqual([devices[0], devices[2], devices[3]])

    devices = res.body
  })

  it('logout by the third device', async () => {
    await request(httpServer)
      .post(`${PATHS.auth}/logout`)
      .set('Cookie', `refreshToken=${tokens3.refreshToken}`)
      .expect(204)
  })

  it('get all devices without logged out device', async () => {
    const res = await request(httpServer)
      .get(PATHS.devices)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(200)

    expect(res.body.length).toBe(2)
    expect(res.body).toEqual([devices[0], devices[2]])

    devices = res.body
  })

  it('delete all the rest devices by the first device', async () => {
    await request(httpServer)
      .delete(PATHS.devices)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(204)
  })

  it('get all devices without all the rest deleted devices', async () => {
    const res = await request(httpServer)
      .get(PATHS.devices)
      .set('Cookie', `refreshToken=${tokens1.refreshToken}`)
      .expect(200)

    expect(res.body.length).toBe(1)
    expect(res.body).toEqual([devices[0]])

    devices = res.body
  })
})
