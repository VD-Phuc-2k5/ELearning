export interface IForumGateway {
  emitPostNew(forumId: string, payload: unknown): void;
  emitCommentNew(forumId: string, postId: string, payload: unknown): void;
  emitCommentDeleted(forumId: string, postId: string, payload: unknown): void;
  emitReactionUpdate(forumId: string, postId: string, payload: unknown): void;
  emitPollUpdate(postId: string, payload: unknown): void;
  emitPostHidden(forumId: string, payload: unknown): void;
  emitPostRestored(forumId: string, payload: unknown): void;
  emitNotification(userId: string, payload: unknown): void;
  emitReportCreated(payload: unknown): void;
  emitBankReviewed(payload: unknown, affectedUserId?: string): void;
}

export const FORUM_GATEWAY = Symbol('IForumGateway');
