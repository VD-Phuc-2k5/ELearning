export interface ForumBookmarkDomain {
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface ForumFollowDomain {
  userId: string;
  forumId: string;
  createdAt: Date;
}
