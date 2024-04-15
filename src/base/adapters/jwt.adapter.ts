import { Injectable } from '@nestjs/common'
import { WithId } from 'mongodb'
import { UserDBModel } from '../../features/users/domain/types'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AppSettings } from '../../settings/app.settings'
import { TokensPayload } from '../../features/auth/application/types'
import { CryptoAdapter } from './crypto.adapter'
import { UsersRepository } from '../../features/users/infrastructure/users.repository'

@Injectable()
export class JwtAdapter {
  constructor(
    protected readonly appSettings: AppSettings,
    protected readonly cryptoAdapter: CryptoAdapter,
    protected readonly usersRepository: UsersRepository,
  ) {}

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

  async generateTokens(
    user: WithId<UserDBModel>,
    deviceId: string,
  ): Promise<(TokensPayload & { encryptedRefreshToken: string }) | null> {
    const accessToken = this.createToken(user, deviceId, 'access')
    const refreshToken = this.createToken(user, deviceId, 'refresh')
    const encryptedRefreshToken = this.cryptoAdapter.encrypt(refreshToken)
    return { accessToken, refreshToken, encryptedRefreshToken }
  }

  async verifyRefreshToken(refreshToken: string) {
    // const payload = await this.verifyToken(refreshToken, 'refresh')
    // if (!payload) {
    //   return null
    // }
    // const { userId, deviceId } = payload
    // const user = await this.usersRepository.findUserById(userId)
    // if (!user) {
    //   return null
    // }
    // const device = await this.devicesRepository.findDeviceById(deviceId)
    // if (!device) {
    //   return null
    // }
    // const decryptedRefreshToken = this.cryptoAdapter.decrypt(
    //   device.refreshToken,
    // )
    // const isMatched = refreshToken === decryptedRefreshToken
    // if (!isMatched) {
    //   return null
    // }
    // return { user, device }
  }
}
