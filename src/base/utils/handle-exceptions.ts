import { StatusCode } from '../interlayer-object'
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

export function handleExceptions(statusCode: StatusCode) {
  if (statusCode === StatusCode.BadRequest) {
    throw new BadRequestException()
  }
  if (statusCode === StatusCode.Unauthorized) {
    throw new UnauthorizedException()
  }
  if (statusCode === StatusCode.Forbidden) {
    throw new ForbiddenException()
  }
  if (statusCode === StatusCode.NotFound) {
    throw new NotFoundException()
  }
  if (statusCode === StatusCode.ServerError) {
    throw new InternalServerErrorException()
  }
}
