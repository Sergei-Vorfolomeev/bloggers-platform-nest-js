import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest()
    if (request.headers.authorization) {
      return request.headers.authorization.split(' ')[1]
    }
    return null
  },
)
