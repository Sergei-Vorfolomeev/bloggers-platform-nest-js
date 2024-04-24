import { INestApplication } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserTestHelper } from './utils/user-test.helper'
import { BlogTestHelper } from './utils/blog-test.helper'
import { PostTestHelper } from './utils/post-test.helper'
import process from 'process'
import { initTestSettings } from './utils/init-test.settings'
import request from 'supertest'
import { PATHS } from '../src/base/const/paths'

describe('LikesFlow (e2e)', () => {
  let app: INestApplication
  let mongoServer: MongoMemoryServer
  let httpServer: any

  const userTestHelper = new UserTestHelper()
  const blogTestHelper = new BlogTestHelper()
  const postTestHelper = new PostTestHelper(blogTestHelper)

  const credentials = Buffer.from(
    `${process.env.BASIC_LOGIN}:${process.env.BASIC_PASSWORD}`,
  ).toString('base64')

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

  let users: any = null
  let token: any = null
  it('try to login user 1', async () => {
    users = await userTestHelper.createManyUsers(httpServer, 2, credentials)
    const res = await request(httpServer)
      .post(`${PATHS.auth}/login`)
      .send({
        loginOrEmail: users[0].login,
        password: 'test-pass',
      })
      .expect(200)
    token = res.body.accessToken
    expect(token).toBeDefined()
  })

  it('create comment without token', async () => {
    const post = await postTestHelper.createPost(httpServer, credentials)
    await request(httpServer)
      .post(`${PATHS.posts}/${post.id}/comments`)
      .send({
        content: 'comment content min 20 symbols',
      })
      .expect(401)
  })

  it('create invalid comment', async () => {
    const post = await postTestHelper.createPost(httpServer, credentials)
    await request(httpServer)
      .post(`${PATHS.posts}/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'comment content',
      })
      .expect(400, {
        errorsMessages: [
          {
            message: 'content must be longer than or equal to 20 characters',
            field: 'content',
          },
        ],
      })
  })

  let post: any = null
  let comment: any = null
  it('create valid comment', async () => {
    const userInfo = await userTestHelper.meRequest(httpServer, token)
    post = await postTestHelper.createPost(httpServer, credentials)
    const res = await request(httpServer)
      .post(`${PATHS.posts}/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'comment content min 20 symbols',
      })
      .expect(201)
    comment = res.body
    expect(comment).toEqual({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: userInfo.userId,
        userLogin: userInfo.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
      },
    })
  })

  it('get comment by id', async () => {
    await request(httpServer)
      .get(`${PATHS.comments}/${comment.id}`)
      .expect(200, comment)
  })

  it('get comments by post id', async () => {
    await request(httpServer)
      .get(`${PATHS.posts}/${post.id}/comments`)
      .expect(200, {
        items: [comment],
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 1,
      })
  })

  it('update created comment', async () => {
    await request(httpServer)
      .put(`${PATHS.comments}/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'updated comment lalalalalalal',
      })
      .expect(204)
  })

  let token2: any = null
  it('try to login user 2', async () => {
    users[1] = await userTestHelper.createUser(httpServer, credentials)
    const res = await request(httpServer)
      .post(`${PATHS.auth}/login`)
      .send({
        loginOrEmail: users[1].login,
        password: 'test-pass',
      })
      .expect(200)
    token2 = res.body.accessToken
    expect(token).toBeDefined()
  })

  it('delete created comment with no credentials', async () => {
    await request(httpServer)
      .delete(`${PATHS.comments}/${comment.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403)
  })

  it('delete created comment', async () => {
    await request(httpServer)
      .delete(`${PATHS.comments}/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
})
