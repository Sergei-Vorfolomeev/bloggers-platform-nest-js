import { LikeStatus } from '../../domain/types'
import { IsIn } from 'class-validator'
import { isValidString } from '../../../../infrastructure/decorators/is-valid-string.decorator'

export class LikeInputModel {
  @IsIn(['Like', 'Dislike', 'None'])
  @isValidString()
  likeStatus: LikeStatus
}
