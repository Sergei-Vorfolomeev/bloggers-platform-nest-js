import { Controller, Delete, HttpCode } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Blog, BlogModel } from './features/blogs/domain/blog.entity'
import { Post, PostModel } from './features/posts/domain/post.entity'
import { User, UserModel } from './features/users/domain/user.entity'
import {
  Comment,
  CommentModel,
} from './features/comments/domain/comment.entity'
import { Device, DeviceModel } from './features/devices/domain/device.entity'
import { Like, LikeModel } from './features/likes/domain/like.entity'

@Controller('testing')
export class TestController {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModel,
    @InjectModel(Post.name) private readonly postModel: PostModel,
    @InjectModel(User.name) private readonly userModel: UserModel,
    @InjectModel(Comment.name) private readonly commentModel: CommentModel,
    @InjectModel(Device.name) private readonly deviceModel: DeviceModel,
    @InjectModel(Like.name) private readonly likeModel: LikeModel,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogModel.deleteMany({})
    await this.postModel.deleteMany({})
    await this.userModel.deleteMany({})
    await this.commentModel.deleteMany({})
    await this.deviceModel.deleteMany({})
    await this.likeModel.deleteMany({})
  }
}
