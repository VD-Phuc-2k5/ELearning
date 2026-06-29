import type {
  ForumDraftDomain,
  ForumPostAttachmentDomain,
} from '../entities/forum-draft.domain';
import type { PostType } from '../entities/forum-post.domain';

export interface UpsertDraftInput {
  authorId: string;
  forumId?: string;
  title?: string;
  content?: Record<string, unknown>;
  postType?: PostType;
}

export interface IForumDraftRepository {
  findByAuthor(
    authorId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumDraftDomain[]; total: number }>;
  findById(id: string): Promise<ForumDraftDomain | null>;
  upsert(
    input: UpsertDraftInput,
    existingId?: string,
  ): Promise<ForumDraftDomain>;
  delete(id: string): Promise<void>;
}

export interface IForumPostAttachmentRepository {
  create(input: {
    postId: string;
    fileUrl: string;
    fileName: string;
    fileType?: string;
    fileSize?: number;
  }): Promise<ForumPostAttachmentDomain>;
  findByPost(postId: string): Promise<ForumPostAttachmentDomain[]>;
}

export const FORUM_DRAFT_REPOSITORY = Symbol('IForumDraftRepository');
export const FORUM_POST_ATTACHMENT_REPOSITORY = Symbol(
  'IForumPostAttachmentRepository',
);
