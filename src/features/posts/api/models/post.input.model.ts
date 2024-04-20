import { MaxLength } from 'class-validator'
import { isValidString } from '../../../../base/decorators/is-valid-string.decorator'
import { BlogIsExist } from '../../../../base/decorators/blog-is-exist.decorator'

export class PostInputModel {
  @MaxLength(30)
  @isValidString()
  title: string

  @MaxLength(100)
  @isValidString()
  shortDescription: string

  @MaxLength(1000)
  @isValidString()
  content: string
}

export class PostInputModelWithBlogId extends PostInputModel {
  @BlogIsExist()
  @isValidString()
  blogId: string
}
