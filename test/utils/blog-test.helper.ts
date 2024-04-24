import { PATHS } from '../../src/base/const/paths'
import request from 'supertest'

export class BlogTestHelper {
  async createBlog(httpServer: any, credentials: string) {
    const response = await request(httpServer)
      .post(PATHS.blogs)
      .set('Authorization', `Basic ${credentials}`)
      .send({
        name: 'test-blog',
        description: 'test',
        websiteUrl: 'https://test-website.com',
      })
      .expect(201)
    return response.body
  }

  async createManyBlogs(httpServer: any, count: number, credentials: string) {
    const blogs = []
    for (let i = 0; i < count; i++) {
      try {
        const response = await request(httpServer)
          .post(PATHS.blogs)
          .set('Authorization', `Basic ${credentials}`)
          .send({
            name: `test-${i}-blog`,
            description: `test-${i}-description`,
            websiteUrl: `https://test-${i}.com`,
          })
          .expect(201)
        blogs.push(response.body)
      } catch (e) {
        console.error(e)
      }
    }
    return blogs.reverse()
  }
}
