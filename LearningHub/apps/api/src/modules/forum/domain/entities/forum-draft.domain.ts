import type { PostType } from './forum-post.domain';

export interface ForumDraftDomain {
  id: string;
  authorId: string;
  forumId: string | null;
  title: string | null;
  content: Record<string, unknown> | null;
  postType: PostType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPostAttachmentDomain {
  id: string;
  postId: string;
  fileUrl: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
}
