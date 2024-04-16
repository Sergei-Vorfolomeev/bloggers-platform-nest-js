export type CommentDBModel = {
  content: string
  commentatorInfo: CommentatorInfo
  postId: string
  createdAt: string
  likesInfo: {
    likesCount: number
    dislikesCount: number
  }
}

export type CommentatorInfo = {
  userId: string
  userLogin: string
}
