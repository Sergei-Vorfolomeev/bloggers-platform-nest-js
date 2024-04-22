import { Length } from 'class-validator'
import { isValidString } from '../../../../infrastructure/decorators/is-valid-string.decorator'

export class CommentInputModel {
  @Length(20, 300)
  @isValidString()
  content: string
}
