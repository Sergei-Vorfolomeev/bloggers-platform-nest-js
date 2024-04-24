import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../settings/configuration'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<ConfigType, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const auth = request.headers.authorization
    if (!auth) {
      throw new UnauthorizedException()
    }
    const [basic, token] = auth.split(' ')
    if (basic !== 'Basic') {
      throw new UnauthorizedException()
    }
    const decodedToken = Buffer.from(token, 'base64').toString()
    const [login, password] = decodedToken.split(':')

    if (
      login ===
        this.configService.get('basicAuth.BASIC_LOGIN', {
          infer: true,
        }) &&
      password ===
        this.configService.get('basicAuth.BASIC_PASSWORD', {
          infer: true,
        })
    ) {
      return true
    }
    throw new UnauthorizedException()
  }
}
