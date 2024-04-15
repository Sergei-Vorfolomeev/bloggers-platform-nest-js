import { Injectable } from '@nestjs/common'
import { WithId } from 'mongodb'
import { UserDBModel } from '../../features/users/domain/types'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AppSettings } from '../../settings/app.settings'

@Injectable()
export class JwtAdapter {
  constructor(protected readonly appSettings: AppSettings) {}

  createToken(
    user: WithId<UserDBModel>,
    deviceId: string,
    type: 'access' | 'refresh',
  ) {
    return jwt.sign(
      {
        userId: user._id.toString(),
        deviceId,
      },
      type === 'access'
        ? this.appSettings.SECRET_KEY_1
        : this.appSettings.SECRET_KEY_2,
      { expiresIn: type === 'access' ? '3000s' : '6000s' },
    )
  }

  async verifyToken(
    token: string,
    type: 'access' | 'refresh',
  ): Promise<JwtPayload | null> {
    try {
      const secretKey =
        type === 'access'
          ? this.appSettings.SECRET_KEY_1
          : this.appSettings.SECRET_KEY_2
      return jwt.verify(token, secretKey) as JwtPayload
    } catch (error) {
      console.error('Token verification has the following error: ' + error)
      return null
    }
  }
}
