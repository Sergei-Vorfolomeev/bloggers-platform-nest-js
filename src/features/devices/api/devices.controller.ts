import {
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common'
import { UsersService } from '../../users/application/users.service'
import { DeviceOutputModel } from './models/device.output.model'
import { Request } from 'express'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { StatusCode } from '../../../base/interlayer-object'
import { ObjectId } from 'mongodb'

@Controller('security/devices')
export class DevicesController {
  constructor(protected readonly usersService: UsersService) {}

  @Get()
  async getDevices(@Req() req: Request): Promise<DeviceOutputModel[]> {
    const refreshToken = req.cookies.refreshToken
    const { statusCode, error, data } =
      await this.usersService.getDevices(refreshToken)
    handleExceptions(statusCode, error)
    if (!data) {
      throw new InternalServerErrorException()
    }
    return data
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteDeviceById(@Param('id') deviceId: string, @Req() req: Request) {
    const refreshToken = req.cookies.refreshToken
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException()
    }
    const { statusCode, error } = await this.usersService.deleteDeviceById(
      refreshToken,
      id,
    )
    handleExceptions(statusCode, error)
  }

  @Delete()
  @HttpCode(204)
  async deleteDevices(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken
    const { statusCode, error } =
      await this.usersService.deleteOtherDevices(refreshToken)
    handleExceptions(statusCode, error)
  }
}
