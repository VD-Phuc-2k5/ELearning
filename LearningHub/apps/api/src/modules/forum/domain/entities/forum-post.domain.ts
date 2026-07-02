export type PostType =
  | 'text'
  | 'poll'
  | 'share_roadmap'
  | 'share_question_bank';

export type PostStatus = 'published' | 'draft' | 'hidden' | 'deleted';

export interface ForumPostDomain {
  id: string;
  forumId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  title: string;
  content: Record<string, unknown> | null;
  postType: PostType;
  status: PostStatus;
  isPinned: boolean;
  isLocked: boolean;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  roadmapId: string | null;
  questionBankId: string | null;
  tags: Array<{ id: number; name: string; slug: string; color: string | null }>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
