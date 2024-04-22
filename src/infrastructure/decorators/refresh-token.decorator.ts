import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest()
    if (request.cookies) {
      return request.cookies.refreshToken
    } else return null
  },
)
