import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserAttachedInRequest } from '../../features/users/api/models/user.input.model'

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAttachedInRequest | undefined => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)
