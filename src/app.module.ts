import { Module } from '@nestjs/common'
import { BlogsController } from './features/blogs/api/blogs.controller'
import { BlogsService } from './features/blogs/application/blogs.service'
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository'
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { appSettings } from './settings/app.settings'
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

@Module({
  imports: [
    MongooseModule.forRoot(appSettings.MONGO_URI, {
      dbName: 'bloggers-platform',
    }),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [BlogsController, PostsController, UsersController],
  providers: [
    BlogsService,
    PostsService,
    UsersService,
    BcryptAdapter,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    UsersRepository,
    UsersQueryRepository,
  ],
})
export class AppModule {}
