import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import { FORUM_RULE_REPOSITORY } from '../../domain/repositories/forum-rule.repository.interface';
import type { IForumRuleRepository } from '../../domain/repositories/forum-rule.repository.interface';
import type { ForumDomain } from '../../domain/entities/forum.domain';
import type { ForumMemberRole } from '../../domain/entities/forum.domain';
import type { ForumRuleDomain } from '../../domain/entities/forum-rule.domain';

export interface ForumDetailResult {
  forum: ForumDomain;
  memberRole: ForumMemberRole | null;
  rules: ForumRuleDomain[];
}

@Injectable()
export class GetForumDetailUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_RULE_REPOSITORY)
    private readonly ruleRepo: IForumRuleRepository,
  ) {}

  async execute(slug: string, userId?: string): Promise<ForumDetailResult> {
    const forum = await this.forumRepo.findBySlug(slug);
    if (!forum) throw new NotFoundException('Forum not found');

    const member = userId
      ? await this.memberRepo.findByForumAndUser(forum.id, userId)
      : null;

    if (forum.visibility === 'hidden' && !member) {
      throw new NotFoundException('Forum not found');
    }
    if (forum.visibility === 'private' && !member) {
      throw new NotFoundException('Forum not found');
    }

    const actualPostCount = await this.forumRepo.recalculatePostCount(forum.id);
    forum.postCount = actualPostCount;

    const rules = await this.ruleRepo.findByForum(forum.id);

    return {
      forum,
      memberRole: member?.role ?? null,
      rules,
    };
  }
}
