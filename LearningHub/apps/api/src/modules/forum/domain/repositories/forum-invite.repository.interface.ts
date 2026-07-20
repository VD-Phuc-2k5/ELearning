import type { ForumInviteDomain } from '../entities/forum-invite.domain';

export interface CreateInviteInput {
  forumId: string;
  inviterId: string;
  inviteeId?: string;
  token: string;
  expiresAt: Date;
}

export interface IForumInviteRepository {
  create(input: CreateInviteInput): Promise<ForumInviteDomain>;
  findByToken(token: string): Promise<ForumInviteDomain | null>;
  findByForum(
    forumId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumInviteDomain[]; total: number }>;
  findById(id: string): Promise<ForumInviteDomain | null>;
  findByForumAndUser(
    forumId: string,
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumInviteDomain[]; total: number }>;
  updateStatus(id: string, status: string): Promise<ForumInviteDomain>;
  incrementAcceptedCount(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteClosed(): Promise<number>;
}

export const FORUM_INVITE_REPOSITORY = Symbol('IForumInviteRepository');
