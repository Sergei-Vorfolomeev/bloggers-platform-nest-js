import request from 'supertest'
import { BlogTestHelper } from './blog-test.helper'
import { PATHS } from '../../src/base/const/paths'

export class PostTestHelper {
  private readonly blogTestHelper: BlogTestHelper

  constructor(blogTestHelper: BlogTestHelper) {
    this.blogTestHelper = blogTestHelper
  }

  async createPost(app: any, credentials: string) {
    const blog = await this.blogTestHelper.createBlog(app, credentials)
    const response = await request(app)
      .post(PATHS.posts)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        blogId: blog.id,
        title: 'Post title',
        shortDescription: 'Post description',
        content: 'Post content',
      })
      .expect(201)
    return response.body
  }

  async createPosts(app: any, count: number, credentials: string) {
    const blog = await this.blogTestHelper.createBlog(app, credentials)
    const posts = []
    for (let i = 0; i < count; i++) {
      try {
        const response = await request(app)
          .post(PATHS.posts)
          .set('Authorization', `Basic ${credentials}`)
          .send({
            blogId: blog.id,
            title: `Post-${i}-title`,
            shortDescription: `Post-${i}-description`,
            content: `Post-${i}-content`,
          })
          .expect(201)
        posts.push(response.body)
      } catch (e) {
        console.error(e)
      }
    }
    const reversedPosts = posts.reverse()
    return { reversedPosts, blog }
  }

  async createPostWithComment(
    httpServer: any,
    credentials: string,
    accessToken: string,
  ) {
    const post = await this.createPost(httpServer, credentials)
    const response = await request(httpServer)
      .post(`${PATHS.posts}/${post.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'comment content min 20 symbols',
      })
      .expect(201)

    const comment = response.body
    expect(comment).toEqual({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: expect.any(String),
      },
      createdAt: expect.any(String),
      likesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
      },
    })
    return comment
  }
}
