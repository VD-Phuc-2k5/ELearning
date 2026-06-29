export interface ForumListItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly visibility: 'public' | 'private' | 'hidden';
  readonly memberCount: number;
  readonly postCount: number;
}

export interface ForumDetail extends ForumListItem {
  readonly bannerUrl: string | null;
  readonly iconUrl: string | null;
  readonly ownerId: string;
  readonly isLocked: boolean;
}

export interface ForumRule {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface ForumDetailResponse {
  forum: ForumDetail;
  memberRole: 'owner' | 'moderator' | 'member' | null;
  rules: ForumRule[];
}

export interface PostListItem {
  readonly id: string;
  readonly title: string;
  readonly authorId: string;
  readonly postType: 'text' | 'poll' | 'share_roadmap' | 'share_question_bank';
  readonly status: 'published' | 'draft' | 'hidden' | 'deleted';
  readonly isPinned: boolean;
  readonly commentCount: number;
  readonly reactionCount: number;
  readonly viewCount: number;
  readonly createdAt: string;
  readonly forumId: string;
}

export interface CommentItem {
  readonly id: string;
  readonly postId: string;
  readonly authorId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly content: string;
  readonly replyCount: number;
  readonly reactionCount: number;
  readonly createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface CreateForumParams {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'hidden';
}

export interface JoinForumParams {
  forumId: string;
  message?: string;
}

export interface ListForumsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export interface ListForumPostsParams {
  forumId: string;
  page?: number;
  limit?: number;
  tagId?: number;
}

export interface CreatePostParams {
  forumId: string;
  title: string;
  content?: Record<string, unknown>;
  postType?: string;
  roadmapId?: string;
  questionBankId?: string;
}

export interface ListCommentsParams {
  forumId: string;
  postId: string;
  page?: number;
  limit?: number;
}

export interface CreateCommentParams {
  forumId: string;
  postId: string;
  content: string;
  parentId?: string;
}

export interface TogglePostReactionParams {
  forumId: string;
  postId: string;
  emoji: string;
  add: boolean;
}

export interface TogglePostBookmarkParams {
  postId: string;
  add: boolean;
}
