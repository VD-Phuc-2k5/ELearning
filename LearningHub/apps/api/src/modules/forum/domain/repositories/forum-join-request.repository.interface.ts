import type { ForumJoinRequestDomain } from '../entities/forum-join-request.domain';

export interface CreateJoinRequestInput {
  forumId: string;
  userId: string;
  message?: string;
}

export interface IForumJoinRequestRepository {
  create(input: CreateJoinRequestInput): Promise<ForumJoinRequestDomain>;
  findByForumAndUser(
    forumId: string,
    userId: string,
  ): Promise<ForumJoinRequestDomain | null>;
  findById(id: string): Promise<ForumJoinRequestDomain | null>;
  findByForum(
    forumId: string,
    status?: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumJoinRequestDomain[]; total: number }>;
  updateStatus(
    id: string,
    status: string,
    reviewedBy: string,
  ): Promise<ForumJoinRequestDomain>;
  countByForum(forumId: string): Promise<number>;
}

export const FORUM_JOIN_REQUEST_REPOSITORY = Symbol(
  'IForumJoinRequestRepository',
);
