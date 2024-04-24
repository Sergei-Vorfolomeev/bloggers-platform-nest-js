import request from 'supertest'
import { BlogTestHelper } from './blog-test.helper'
import { PATHS } from '../../src/base/const/paths'

export class PostTestHelper {
  private readonly credentials: string
  private readonly blogTestHelper: BlogTestHelper

  constructor(credentials: string, blogTestHelper: BlogTestHelper) {
    this.credentials = credentials
    this.blogTestHelper = blogTestHelper
  }

  async createPost(app: any) {
    const blog = await this.blogTestHelper.createBlog(app)
    const response = await request(app)
      .post(PATHS.posts)
      .set('Authorization', `Basic ${this.credentials}`)
      .send({
        blogId: blog.id,
        title: 'Post title',
        shortDescription: 'Post description',
        content: 'Post content',
      })
      .expect(201)
    return response.body
  }

  async createPosts(app: any, count: number) {
    const blog = await this.blogTestHelper.createBlog(app)
    const posts = []
    for (let i = 0; i < count; i++) {
      try {
        const response = await request(app)
          .post(PATHS.posts)
          .set('Authorization', `Basic ${this.credentials}`)
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

  async createPostWithComment(app: any, accessToken: string) {
    const post = await this.createPost(app)
    const response = await request(app)
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
