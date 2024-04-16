import { LikeStatus } from '../../../likes/domain/types'

export type CommentOutputModel = {
  id: string
  content: string
  commentatorInfo: CommentatorInfo
  createdAt: string
  likesInfo: LikesInfoViewModel
}

export type CommentatorInfo = {
  userId: string
  userLogin: string
}

export type LikesInfoViewModel = {
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatus
}
