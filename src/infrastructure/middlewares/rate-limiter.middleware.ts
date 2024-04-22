import { Request, Response, NextFunction } from 'express'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { sub } from 'date-fns/sub'
import { ConnectionDBModel } from '../../features/connections/domain/types'
import { InjectModel } from '@nestjs/mongoose'
import {
  Connection,
  ConnectionModel,
} from '../../features/connections/domain/connection.entity'
import { TooManyRequestsException } from '../exception-filters/too-many-requests.exception'

@Injectable()
export class RateLimiter implements NestMiddleware {
  constructor(
    @InjectModel(Connection.name)
    private readonly connectionModel: ConnectionModel,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { ip, originalUrl } = req
    const newConnectionDto: ConnectionDBModel = {
      ip: ip || 'unknown',
      routePath: originalUrl,
      createdAt: new Date(),
    }
    const limit = sub(new Date(), {
      seconds: 10,
    })
    const newConnection = new this.connectionModel(newConnectionDto)
    await newConnection.save()
    const lastConnections = await this.connectionModel.countDocuments({
      ip: ip,
      routePath: originalUrl,
      createdAt: { $gte: limit },
    })
    if (lastConnections > 5) {
      throw new TooManyRequestsException()
    }
    next()
  }
}
