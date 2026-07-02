import type { ForumTagDomain } from '../entities/forum-tag.domain';

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

export interface IForumTagRepository {
  findAll(): Promise<ForumTagDomain[]>;
  findById(id: number): Promise<ForumTagDomain | null>;
  create(input: CreateTagInput): Promise<ForumTagDomain>;
  update(id: number, input: UpdateTagInput): Promise<ForumTagDomain>;
  delete(id: number): Promise<void>;
}

export const FORUM_TAG_REPOSITORY = Symbol('IForumTagRepository');
