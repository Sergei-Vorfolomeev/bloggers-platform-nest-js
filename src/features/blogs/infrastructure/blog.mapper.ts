import { BlogDBModel } from '../domain/types'
import { BlogOutputModel } from '../api/models/blog.output.models'
import { WithId } from 'mongodb'

export const blogMapper = (blog: WithId<BlogDBModel>): BlogOutputModel => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  }
}
