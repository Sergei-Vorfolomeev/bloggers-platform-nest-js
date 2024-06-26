import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { PATHS } from '../src/base/const/paths'
import { ObjectId } from 'mongodb'
import process from 'process'
import { initTestSettings } from './utils/init-test.settings'

describe('BlogsController (e2e)', () => {
  let app: INestApplication
  let mongoServer: MongoMemoryServer
  let httpServer: any
  const credentials = Buffer.from(
    `${process.env.BASIC_LOGIN}:${process.env.BASIC_PASSWORD}`,
  ).toString('base64')

  beforeAll(async () => {
    const res = await initTestSettings()
    app = res.app
    mongoServer = res.mongoServer
    httpServer = res.httpServer
  })

  afterAll(async () => {
    await request(httpServer).delete(PATHS.__test__).expect(204)
    await mongoServer.stop()
    await app.close()
  })

  it('get all blogs (GET)', async () => {
    const res = await request(httpServer).get(PATHS.blogs).expect(200)

    expect(res.body).toEqual({
      items: [],
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 0,
    })
  })

  it('create blog without auth', async () => {
    await request(httpServer)
      .post(PATHS.blogs)
      .send({
        name: 'Valid name',
        description: 'Valid description',
        websiteUrl: 'https://valid-site.com',
      })
      .expect(401)
  })

  it('create invalid blog', async () => {
    await request(httpServer)
      .post(PATHS.blogs)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        name: 'suchALongerName1234567890',
        description: '',
        websiteUrl: '12345',
      })
      .expect(400, {
        errorsMessages: [
          {
            message: 'name must be shorter than or equal to 15 characters',
            field: 'name',
          },
          {
            message: 'description should not be empty',
            field: 'description',
          },
          {
            message: 'websiteUrl must be a URL address',
            field: 'websiteUrl',
          },
        ],
      })
  })

  it('get blogs without invalid blog', async () => {
    await request(httpServer).get(PATHS.blogs).expect(200, {
      items: [],
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 0,
    })
  })

  let createdBlog: any = null
  it('create valid blog', async () => {
    const res = await request(httpServer)
      .post(PATHS.blogs)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        name: 'Valid name',
        description: 'Valid description',
        websiteUrl: 'https://valid-site.com',
      })
      .expect(201)
    createdBlog = res.body
    expect(createdBlog).toEqual({
      id: expect.any(String),
      ...createdBlog,
    })
  })

  it('get created blog by id', async () => {
    await request(httpServer)
      .get(`${PATHS.blogs}/${createdBlog.id}`)
      .expect(200, createdBlog)
  })

  it('get blogs with created blog', async () => {
    await request(httpServer)
      .get(PATHS.blogs)
      .expect(200, {
        items: [createdBlog],
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 1,
      })
  })

  it('update blog with invalid data', async () => {
    await request(httpServer)
      .put(`${PATHS.blogs}/${createdBlog.id}`)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        name: 'suchALongerName1234567890',
        description: '',
        websiteUrl: '12345',
      })
      .expect(400, {
        errorsMessages: [
          {
            message: 'name must be shorter than or equal to 15 characters',
            field: 'name',
          },
          {
            message: 'description should not be empty',
            field: 'description',
          },
          {
            message: 'websiteUrl must be a URL address',
            field: 'websiteUrl',
          },
        ],
      })
  })

  it('update blog with non-existing id', async () => {
    const validMongoID = new ObjectId().toHexString()
    await request(httpServer)
      .put(`${PATHS.blogs}/${validMongoID}`)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        name: 'valid',
        description: 'valid',
        websiteUrl: 'https://valid.com',
      })
      .expect(404)
  })

  it('delete created blog with non-existing id', async () => {
    const validMongoID = new ObjectId().toHexString()
    await request(httpServer)
      .delete(`${PATHS.blogs}/${validMongoID}`)
      .set('Authorization', `Basic ${credentials}`)
      .expect(404)
  })

  it('delete blog without auth', async () => {
    await request(httpServer)
      .delete(`${PATHS.blogs}/${createdBlog.id}`)
      .expect(401)
  })

  it('delete created blog', async () => {
    await request(httpServer)
      .delete(`${PATHS.blogs}/${createdBlog.id}`)
      .set('Authorization', `Basic ${credentials}`)
      .expect(204)
  })
})
