import {
  registerDecorator,
  ValidatorConstraint,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Injectable } from '@nestjs/common'
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/blogs.query.repository'

// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
// регистрация в providers для доступа из ioc контейнера
@ValidatorConstraint({ name: 'BlogIsExist', async: false })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async validate(value: any): Promise<boolean> {
    const doesBlogExist = await this.blogsQueryRepository.getBlogById(value)
    return Boolean(doesBlogExist)
  }

  defaultMessage(): string {
    return 'Blog with provided id does not exist'
  }
}

export function BlogIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    })
  }
}
