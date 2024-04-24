import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { PATHS } from '../src/base/const/paths'
import { initTestSettings } from './utils/init-test.settings'
import { INestApplication } from '@nestjs/common'
import process from 'process'
import { UserTestHelper } from './utils/user-test.helper'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  let mongoServer: MongoMemoryServer
  let httpServer: any
  const credentials = Buffer.from(
    `${process.env.BASIC_LOGIN}:${process.env.BASIC_PASSWORD}`,
  ).toString('base64')
  const usersTestHelper = new UserTestHelper(credentials)

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

  it('get empty users', async () => {
    await request(httpServer).get(PATHS.users).expect(200, {
      items: [],
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 0,
    })
  })

  it('create user without auth', async () => {
    await request(httpServer)
      .post(PATHS.users)
      .send({
        login: 'validLogin',
        email: 'validEmail@gmail.com',
        password: 'validPassword',
      })
      .expect(401)
  })

  it('create invalid user', async () => {
    await request(httpServer)
      .post(PATHS.users)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        login: 'INVALID INVALID INVALID INVALID INVALID INVALID ',
        email: '123',
      })
      .expect(400, {
        errorsMessages: [
          {
            message: 'login must be shorter than or equal to 10 characters',
            field: 'login',
          },
          {
            message: 'email must be an email',
            field: 'email',
          },
          {
            message: 'password should not be empty',
            field: 'password',
          },
        ],
      })
  })

  let createdUser: any = null
  it('create valid user', async () => {
    const res = await request(httpServer)
      .post(PATHS.users)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        login: 'valid',
        email: 'valid@gmail.com',
        password: 'validPassword',
      })
      .expect(201)
    createdUser = res.body
    expect(createdUser).toEqual({
      id: expect.any(String),
      ...createdUser,
    })
  })

  it('get created user by id', async () => {
    await request(httpServer)
      .get(`${PATHS.users}/${createdUser.id}`)
      .expect(200, createdUser)
  })

  it('delete created user', async () => {
    await request(httpServer)
      .delete(`${PATHS.users}/${createdUser.id}`)
      .set('Authorization', `Basic ${credentials}`)
      .expect(204)
  })

  let users: any[] = []
  it('create many users', async () => {
    users = await usersTestHelper.createManyUsers(httpServer, 15)
  })

  it('get all users', async () => {
    const expectedResponse = users.slice(0, 10)
    const res = await request(httpServer).get(PATHS.users).expect(200)

    expect(res.body).toEqual({
      items: expectedResponse,
      page: 1,
      pageSize: 10,
      pagesCount: 2,
      totalCount: 15,
    })
  })

  it('get users with query params', async () => {
    const expectedResponse = users
      .slice()
      .reverse()
      .slice(5, 10)
      .sort((a, b) => a.createdAt - b.createdAt)
    const res = await request(httpServer)
      .get(PATHS.users)
      .query({
        sortBy: 'createdAt',
        sortDirection: 'asc',
        pageNumber: 2,
        pageSize: 5,
      })
      .expect(200)

    expect(res.body).toEqual({
      items: expectedResponse,
      page: 2,
      pageSize: 5,
      pagesCount: 3,
      totalCount: 15,
    })
  })

  it('get users with search param', async () => {
    const expectedResponse = users.filter((u) => u.login.match('1')).slice(0, 5)
    const res = await request(httpServer)
      .get(PATHS.users)
      .query({
        searchLoginTerm: '1',
        pageNumber: 1,
        pageSize: 5,
      })
      .expect(200)

    expect(res.body).toEqual({
      items: expectedResponse,
      page: 1,
      pageSize: 5,
      pagesCount: 2,
      totalCount: 6,
    })
  })
})
