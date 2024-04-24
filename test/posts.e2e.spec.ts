import { NestApplication } from '@nestjs/core'
import { MongoMemoryServer } from 'mongodb-memory-server'
import process from 'process'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { applyAppSettings } from '../src/settings/apply-app-settings'
import { ConfigService } from '@nestjs/config'
import request from 'supertest'
import { PATHS } from '../src/base/const/paths'
import { ObjectId } from 'mongodb'

describe('PostsController (e2e)', () => {
  let app: NestApplication
  let mongoServer: MongoMemoryServer
  const credentials = Buffer.from(
    `${process.env.BASIC_LOGIN}:${process.env.BASIC_PASSWORD}`,
  ).toString('base64')

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URL = mongoServer.getUri()

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    applyAppSettings(app)
    await app.init()
    const configService = app.get(ConfigService)
    const env = configService.get<string>('env')
    console.log(`Environment: ${env}`)

    await request(app.getHttpServer()).delete(PATHS.__test__).expect(204)
  })

  afterAll(async () => {
    await request(app.getHttpServer()).delete(PATHS.__test__).expect(204)
    await app.close()
    await mongoServer.stop()
  })

  it('get empty posts', async () => {
    await request(app.getHttpServer()).get(PATHS.posts).expect(200, {
      items: [],
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 0,
    })
  })

  let createdBlog: any = null
  it('create valid blog', async () => {
    const res = await request(app.getHttpServer())
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
    const res = await request(app.getHttpServer())
      .get(`${PATHS.blogs}/${createdBlog.id}`)
      .expect(200, createdBlog)
    createdBlog = res.body
  })

  it('create post without auth', async () => {
    await request(app.getHttpServer())
      .post(PATHS.posts)
      .send({
        blogId: createdBlog.id,
        title: 'Valid title',
        shortDescription: 'Valid description',
        content: 'https://valid-site.com',
      })
      .expect(401)
  })

  it('create invalid post', async () => {
    const mongoId = new ObjectId().toHexString()
    const res = await request(app.getHttpServer())
      .post(PATHS.posts)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        blogId: mongoId,
        title: 'suchALongerName1234567890   suchALongerName1234567890',
        shortDescription: '',
      })
      .expect(400)

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Blog with provided id does not exist',
          field: 'blogId',
        },
        {
          message: 'title must be shorter than or equal to 30 characters',
          field: 'title',
        },
        {
          message: 'shortDescription should not be empty',
          field: 'shortDescription',
        },
        {
          message: 'content should not be empty',
          field: 'content',
        },
      ],
    })
  })

  it('get posts without invalid post', async () => {
    await request(app.getHttpServer()).get(PATHS.posts).expect(200, {
      items: [],
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 0,
    })
  })

  let createdPost: any = null
  it('create valid post', async () => {
    const res = await request(app.getHttpServer())
      .post(PATHS.posts)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        blogId: createdBlog.id,
        title: 'Valid title',
        shortDescription: 'Valid description',
        content: 'Valid content',
      })
      .expect(201)
    createdPost = res.body
    expect(createdPost).toEqual({
      id: expect.any(String),
      blogName: createdBlog.name,
      ...createdPost,
    })
  })

  it('get created post by id', async () => {
    await request(app.getHttpServer())
      .get(`${PATHS.posts}/${createdPost.id}`)
      .expect(200, createdPost)
  })

  it('get posts with created post', async () => {
    await request(app.getHttpServer())
      .get(PATHS.posts)
      .expect(200, {
        items: [createdPost],
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 1,
      })
  })

  it('update post with invalid data', async () => {
    const mongoId = new ObjectId().toHexString()
    const res = await request(app.getHttpServer())
      .put(`${PATHS.posts}/605c77432fafeaccf424bb55`)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        blogId: mongoId,
        title: 'suchALongerName1234567890 suchALongerName1234567890',
        shortDescription: '',
      })
      .expect(400)

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Blog with provided id does not exist',
          field: 'blogId',
        },
        {
          message: 'title must be shorter than or equal to 30 characters',
          field: 'title',
        },
        {
          message: 'shortDescription should not be empty',
          field: 'shortDescription',
        },
        {
          message: 'content should not be empty',
          field: 'content',
        },
      ],
    })
  })

  it('update post with non-existing id', async () => {
    const mongoIdForPost = new ObjectId().toHexString()
    const mongoIdForBlog = new ObjectId().toHexString()
    await request(app.getHttpServer())
      .put(`${PATHS.posts}/${mongoIdForPost}`)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        blogId: mongoIdForBlog,
        title: 'Valid title',
        shortDescription: 'Valid description',
        content: 'Valid content',
      })
      .expect(400)
  })

  it('update post with valid data', async () => {
    await request(app.getHttpServer())
      .put(`${PATHS.posts}/${createdPost.id}`)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        blogId: createdBlog.id,
        title: 'Changed title',
        shortDescription: 'Changed description',
        content: 'Post Content',
      })
      .expect(204)
  })

  it('get updated post by id', async () => {
    await request(app.getHttpServer())
      .get(`${PATHS.posts}/${createdPost.id}`)
      .expect(200)
      .expect({
        id: createdPost.id,
        blogId: createdBlog.id,
        blogName: createdBlog.name,
        title: 'Changed title',
        shortDescription: 'Changed description',
        content: 'Post Content',
        createdAt: createdPost.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      })
  })

  it('delete created post with non-existing id', async () => {
    const mongoId = new ObjectId().toHexString()
    await request(app.getHttpServer())
      .delete(`${PATHS.posts}/${mongoId}`)
      .set('Authorization', `Basic ${credentials}`)
      .expect(404)
  })

  it('delete post without auth', async () => {
    await request(app.getHttpServer())
      .delete(`${PATHS.posts}/${createdPost.id}`)
      .expect(401)
  })

  it('delete created post', async () => {
    await request(app.getHttpServer())
      .delete(`${PATHS.posts}/${createdPost.id}`)
      .set('Authorization', `Basic ${credentials}`)
      .expect(204)
  })
})
