import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AppSettings } from '../../settings/app.settings'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly appSettings: AppSettings) {}

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
      login === this.appSettings.ADMIN_LOGIN &&
      password === this.appSettings.ADMIN_PASSWORD
    ) {
      return true
    }
    throw new UnauthorizedException()
  }
}
