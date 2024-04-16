import { ObjectId } from 'mongodb'

export type DeviceDBModel = {
  _id: ObjectId
  userId: string
  ip: string
  title: string
  creationDate: string
  refreshToken: string
  lastActiveDate: string
  expirationDate: string
}
