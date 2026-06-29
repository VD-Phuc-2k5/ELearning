export type CommentStatus = 'published' | 'hidden' | 'deleted';

export interface ForumCommentDomain {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  depth: number;
  content: string;
  status: CommentStatus;
  replyCount: number;
  reactionCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
