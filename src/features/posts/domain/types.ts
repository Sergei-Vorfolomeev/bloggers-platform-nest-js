export type PostDBModel = {
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  createdAt: string
  // likesInfo: {
  //   likesCount: number
  //   dislikesCount: number
  // }
}

export type LikeStatus = 'None' | 'Like' | 'Dislike'
