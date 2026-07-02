import type { ForumMemberRole } from '../entities/forum.domain';
import type { ForumMemberDomain } from '../entities/forum-member.domain';

export interface CreateMemberInput {
  forumId: string;
  userId: string;
  role?: ForumMemberRole;
}

export interface MemberListPage {
  data: ForumMemberDomain[];
  total: number;
}

export interface MemberSearchResult {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

export interface IForumMemberRepository {
  create(input: CreateMemberInput): Promise<ForumMemberDomain>;
  findById(id: string): Promise<ForumMemberDomain | null>;
  findByForumAndUser(
    forumId: string,
    userId: string,
  ): Promise<ForumMemberDomain | null>;
  findAll(
    forumId: string,
    page?: number,
    limit?: number,
    role?: ForumMemberRole,
  ): Promise<MemberListPage>;
  searchByName(
    forumId: string,
    keyword: string,
    limit?: number,
  ): Promise<MemberSearchResult[]>;
  updateRole(id: string, role: ForumMemberRole): Promise<ForumMemberDomain>;
  delete(id: string): Promise<void>;
  deleteByForumAndUser(forumId: string, userId: string): Promise<void>;
  countByForum(forumId: string): Promise<number>;
}

export const FORUM_MEMBER_REPOSITORY = Symbol('IForumMemberRepository');
