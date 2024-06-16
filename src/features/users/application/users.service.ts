import { Injectable } from '@nestjs/common'
import { InterLayerObject, StatusCode } from '../../../base/interlayer-object'
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter'
import { UserDBModel } from '../domain/types'
import { UsersRepository } from '../infrastructure/users.repository'
import { JwtAdapter } from '../../../base/adapters/jwt.adapter'
import { DeviceOutputModel } from '../../devices/api/models/device.output.model'
import { DevicesRepository } from '../../devices/infrastructure/devices.repository'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async getUserId(accessToken: string): Promise<string | null> {
    const payload = await this.jwtAdapter.verifyToken(accessToken, 'access')
    if (!payload) {
      return null
    }
    const user = await this.usersRepository.findUserById(payload.userId)
    if (!user) {
      return null
    }
    return payload.userId
  }

  async createUser(
    login: string,
    email: string,
    password: string,
  ): Promise<InterLayerObject<string>> {
    const hashedPassword = await this.bcryptAdapter.generateHash(password)
    if (!hashedPassword) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    const newUser: UserDBModel = {
      login,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: null,
        expirationDate: new Date(),
        isConfirmed: true,
      },
    }
    const createdUserId = await this.usersRepository.createUser(newUser)
    if (!createdUserId) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.Created, null, createdUserId)
  }

  async deleteUser(userId: string): Promise<InterLayerObject> {
    const isDeleted = await this.usersRepository.deleteUser(userId)
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async getDevices(
    refreshToken: string,
  ): Promise<InterLayerObject<DeviceOutputModel[]>> {
    const payload = await this.jwtAdapter.verifyRefreshToken(refreshToken)
    if (!payload) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const devices = await this.devicesRepository.findAllDevicesByUserId(
      payload.user._id.toString(),
    )
    if (!devices) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    const devicesForClient: DeviceOutputModel[] = devices.map((device) => ({
      deviceId: device._id.toString(),
      title: device.title,
      ip: device.ip,
      lastActiveDate: device.lastActiveDate,
    }))
    return new InterLayerObject(StatusCode.Success, null, devicesForClient)
  }

  async deleteDeviceById(refreshToken: string, deviceId: string) {
    const payload = await this.jwtAdapter.verifyRefreshToken(refreshToken)
    if (!payload) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const { user } = payload
    const device = await this.devicesRepository.findDeviceById(deviceId)
    if (!device) {
      return new InterLayerObject(StatusCode.NotFound)
    }
    const userDevices = await this.devicesRepository.findAllDevicesByUserId(
      user._id.toString(),
    )
    if (!userDevices) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    if (!userDevices.find((device) => device._id.toString() === deviceId)) {
      return new InterLayerObject(StatusCode.Forbidden)
    }
    const isDeleted = await this.devicesRepository.deleteDeviceById(deviceId)
    if (!isDeleted) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    return new InterLayerObject(StatusCode.NoContent)
  }

  async deleteOtherDevices(refreshToken: string) {
    const payload = await this.jwtAdapter.verifyRefreshToken(refreshToken)
    if (!payload) {
      return new InterLayerObject(StatusCode.Unauthorized)
    }
    const { user, device } = payload
    const userDevices = await this.devicesRepository.findAllDevicesByUserId(
      user._id.toString(),
    )
    if (!userDevices) {
      return new InterLayerObject(StatusCode.ServerError)
    }
    userDevices.map(async (el) => {
      if (el._id.toString() !== device._id.toString()) {
        await this.devicesRepository.deleteDeviceById(el._id.toString())
      }
    })
    return new InterLayerObject(StatusCode.NoContent)
  }
}
