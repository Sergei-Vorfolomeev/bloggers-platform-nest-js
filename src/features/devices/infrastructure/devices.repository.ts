import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Device, DeviceModel } from '../domain/device.entity'
import { ObjectId } from 'mongodb'
import { DeviceDBModel } from '../domain/types'

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: DeviceModel,
  ) {}

  async findDeviceById(deviceId: string): Promise<DeviceDBModel | null> {
    try {
      return this.deviceModel.findById(new ObjectId(deviceId)).lean().exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async findAllDevicesByUserId(
    userId: string,
  ): Promise<DeviceDBModel[] | null> {
    try {
      return this.deviceModel
        .find()
        .where('userId')
        .equals(userId)
        .lean()
        .exec()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async addNewDevice(device: DeviceDBModel): Promise<string | null> {
    try {
      const newDevice = new this.deviceModel(device)
      await newDevice.save()
      return newDevice._id.toString()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async updateRefreshToken(
    deviceWithNewRefreshToken: DeviceDBModel,
  ): Promise<boolean> {
    try {
      const res = await this.deviceModel.updateOne(
        { _id: deviceWithNewRefreshToken._id },
        { $set: deviceWithNewRefreshToken },
      )
      return res.matchedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      const res = await this.deviceModel.deleteOne({
        _id: new ObjectId(deviceId),
      })
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    try {
      const res = await this.deviceModel.deleteOne({
        _id: new ObjectId(deviceId),
      })
      return res.deletedCount === 1
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
