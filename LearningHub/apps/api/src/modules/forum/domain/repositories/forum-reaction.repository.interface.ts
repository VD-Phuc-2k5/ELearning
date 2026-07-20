import type {
  ForumReactionDomain,
  ReactionTargetType,
} from '../entities/forum-reaction.domain';

export interface IForumReactionRepository {
  findByTargetAndUser(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
  ): Promise<ForumReactionDomain | null>;
  create(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
    emoji: string,
  ): Promise<ForumReactionDomain>;
  delete(id: string): Promise<void>;
  deleteByUser(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
  ): Promise<number>;
  findByTarget(
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ForumReactionDomain[]>;
}

export const FORUM_REACTION_REPOSITORY = Symbol('IForumReactionRepository');
