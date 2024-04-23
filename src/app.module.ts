import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
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
import { BlogIsExistConstraint } from './infrastructure/decorators/blog-is-exist.decorator'
import {
  Connection,
  ConnectionSchema,
} from './features/connections/domain/connection.entity'
import { RateLimiter } from './infrastructure/middlewares/rate-limiter.middleware'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from './settings/configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        dbName: 'bloggers-platform',
        uri: configService.get<string>('db.MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Connection.name, schema: ConnectionSchema },
    ]),
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
  // Регистрация провайдеров
  providers: [
    BlogIsExistConstraint,
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

    // альтернативные способы регистрации провайдера
    /* {
           provide: UsersService,
           useClass: UsersService,
       },*/
    /*{
            provide: UsersService,
            useValue: {method: () => {}},

        },*/
    // Регистрация с помощью useFactory (необходимы зависимости из ioc, подбор провайдера, ...)
    /* {
            provide: UsersService,
            useFactory: (repo: UsersRepository) => {
                return new UsersService(repo);
            },
            inject: [UsersRepository]
        }*/
  ],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimiter).forRoutes(AuthController)
  }
}
