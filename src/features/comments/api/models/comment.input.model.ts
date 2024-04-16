import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CommentInputModel {
  @Length(20, 300)
  @IsString()
  @IsNotEmpty()
  content: string
}
