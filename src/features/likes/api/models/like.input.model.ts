import { LikeStatus } from '../../domain/types'
import { IsIn, IsNotEmpty } from 'class-validator'

export class LikeInputModel {
  @IsIn(['Like', 'Dislike', 'None'])
  @IsNotEmpty()
  likeStatus: LikeStatus
}
