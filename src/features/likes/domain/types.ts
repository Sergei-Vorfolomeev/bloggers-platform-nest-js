export type LikeStatus = 'None' | 'Like' | 'Dislike'

export type LikeDBModel = {
  userId: string
  login: string
  postId?: string
  commentId?: string
  likeStatus: LikeStatus
  addedAt: string
}
