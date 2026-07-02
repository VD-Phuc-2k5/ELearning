import type { ForumDomain, ForumVisibility } from '../entities/forum.domain';

export interface CreateForumInput {
  name: string;
  description?: string;
  visibility?: ForumVisibility;
  bannerUrl?: string;
  iconUrl?: string;
  ownerId: string;
}

export interface GetForumListInput {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: ForumVisibility | 'visible';
  userId?: string;
  isAdmin?: boolean;
}

export interface UpdateForumInput {
  name?: string;
  description?: string;
  visibility?: ForumVisibility;
  bannerUrl?: string;
  iconUrl?: string;
  isLocked?: boolean;
}

export interface ForumListPage {
  data: ForumDomain[];
  total: number;
}

export interface IForumRepository {
  create(input: CreateForumInput): Promise<ForumDomain>;
  findAll(input: GetForumListInput): Promise<ForumListPage>;
  findBySlug(slug: string): Promise<ForumDomain | null>;
  findById(id: string): Promise<ForumDomain | null>;
  update(id: string, input: UpdateForumInput): Promise<ForumDomain>;
  delete(id: string): Promise<void>;
  incrementMemberCount(id: string, delta: number): Promise<void>;
  incrementPostCount(id: string, delta: number): Promise<void>;
  recalculatePostCount(id: string): Promise<number>;
}

export const FORUM_REPOSITORY = Symbol('IForumRepository');
