import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtPayload } from 'jsonwebtoken'
import { JwtAdapter } from '../../base/adapters/jwt.adapter'
import { UsersQueryRepository } from '../../features/users/infrastructure/users.query.repository'

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const auth = request.headers.authorization
    if (!auth) {
      throw new UnauthorizedException()
    }
    const [bearer, token] = auth.split(' ')
    if (bearer !== 'Bearer') {
      throw new UnauthorizedException()
    }
    const payload: JwtPayload | null = await this.jwtAdapter.verifyToken(
      token,
      'access',
    )
    if (!payload) {
      throw new UnauthorizedException()
    }
    const user = await this.usersQueryRepository.getUserById(payload.userId)
    if (!user) {
      throw new UnauthorizedException()
    }
    request.user = { id: user.id }
    return true
  }
}
