import { applyDecorators } from '@nestjs/common'
import { Trim } from './trim.decorator'
import { IsNotEmpty, IsString } from 'class-validator'

export const isValidString = () => {
  return applyDecorators(Trim(), IsNotEmpty(), IsString())
}
