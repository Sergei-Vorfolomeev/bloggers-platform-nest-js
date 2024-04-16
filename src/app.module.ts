import { Module } from '@nestjs/common'
import { BlogsController } from './features/blogs/api/blogs.controller'
import { BlogsService } from './features/blogs/application/blogs.service'
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository'
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity'
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query.repository'
import { PostsService } from './features/posts/application/posts.service'
import { Post, PostSchema } from './features/posts/domain/post.entity'
import { PostsRepository } from './features/posts/infrastructure/posts.repository'
import { PostsController } from './features/posts/api/posts.controller'
import { UsersQueryRepository } from './features/users/infrastructure/users.query.repository'
import { UsersRepository } from './features/users/infrastructure/users.repository'
import { User, UserSchema } from './features/users/domain/user.entity'
import { UsersController } from './features/users/api/users.controller'
import { UsersService } from './features/users/application/users.service'
import { BcryptAdapter } from './base/adapters/bcrypt.adapter'
import { AppSettings } from './settings/app.settings'
import { CryptoAdapter } from './base/adapters/crypto.adapter'
import { AuthService } from './features/auth/application/auth.service'
import { JwtAdapter } from './base/adapters/jwt.adapter'
import { AuthController } from './features/auth/api/auth.controller'
import { EmailAdapter } from './base/adapters/email.adapter'
import {
  Comment,
  CommentSchema,
} from './features/comments/domain/comment.entity'
import { CommentsRepository } from './features/comments/infrastructure/comments.repository'
import { CommentsService } from './features/comments/application/comments.service'
import { LikesQueryRepository } from './features/likes/infrastructure/likes.query.repository'
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query.repository'
import { LikesRepository } from './features/likes/infrastructure/likes.repository'
import { Like, LikeSchema } from './features/likes/domain/like.entity'
import { CommentsController } from './features/comments/api/comments.controller'
import { Device, DeviceSchema } from './features/devices/domain/device.entity'
import { DevicesRepository } from './features/devices/infrastructure/devices.repository'
import { DevicesController } from './features/devices/api/devices.controller'
import { TestController } from './test.controller'

@Module({
  imports: [
    MongooseModule.forRoot(AppSettings.MONGO_URI, {
      dbName: 'bloggers-platform',
    }),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  controllers: [
    TestController,
    AuthController,
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    DevicesController,
  ],
  providers: [
    AppSettings,
    AuthService,
    BlogsService,
    PostsService,
    UsersService,
    CommentsService,

    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    UsersRepository,
    UsersQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    LikesRepository,
    LikesQueryRepository,
    DevicesRepository,

    JwtAdapter,
    BcryptAdapter,
    CryptoAdapter,
    EmailAdapter,
  ],
})
export class AppModule {}
