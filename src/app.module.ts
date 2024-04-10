import { Module } from '@nestjs/common'
import { BlogsController } from './features/blogs/api/blogs.controller'
import { BlogsService } from './features/blogs/application/blogs.service'
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository'
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { appSettings } from './settings/app.settings'
import { Blog, BlogSchema } from './features/blogs/domain/blog.model'

@Module({
  imports: [
    MongooseModule.forRoot(appSettings.MONGO_URI, {
      dbName: 'bloggers-platform',
    }),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class AppModule {}
