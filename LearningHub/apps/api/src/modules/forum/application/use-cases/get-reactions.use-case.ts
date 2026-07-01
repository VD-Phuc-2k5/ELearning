import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_REACTION_REPOSITORY,
  IForumReactionRepository,
} from '../../domain/repositories/forum-reaction.repository.interface';
import type { ReactionTargetType } from '../../domain/entities/forum-reaction.domain';

export interface ReactionGroup {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface GetReactionsResult {
  groups: ReactionGroup[];
  total: number;
}

@Injectable()
export class GetReactionsUseCase {
  constructor(
    @Inject(FORUM_REACTION_REPOSITORY)
    private readonly reactionRepo: IForumReactionRepository,
  ) {}

  async execute(
    targetType: ReactionTargetType,
    targetId: string,
    currentUserId?: string,
  ): Promise<GetReactionsResult> {
    const reactions = await this.reactionRepo.findByTarget(
      targetType,
      targetId,
    );

    const grouped = new Map<string, { count: number; hasCurrent: boolean }>();
    for (const r of reactions) {
      const group = grouped.get(r.emoji) ?? { count: 0, hasCurrent: false };
      group.count++;
      if (currentUserId && r.userId === currentUserId) {
        group.hasCurrent = true;
      }
      grouped.set(r.emoji, group);
    }

    const groups: ReactionGroup[] = [];
    for (const [emoji, { count, hasCurrent }] of grouped) {
      groups.push({ emoji, count, reacted: hasCurrent });
    }
    groups.sort((a, b) => b.count - a.count);

    return { groups, total: reactions.length };
  }
}
