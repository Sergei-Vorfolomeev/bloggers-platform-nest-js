import { BlogDBModel } from '../domain/types'
import { BlogViewModel } from '../api/models/blog.output.models'
import { WithId } from 'mongodb'

export const blogMapper = (blog: WithId<BlogDBModel>): BlogViewModel => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  }
}
