import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import {
  IForumRuleRepository,
  FORUM_RULE_REPOSITORY,
} from '../../domain/repositories/forum-rule.repository.interface';
import type { ForumRuleDomain } from '../../domain/entities/forum-rule.domain';

@Injectable()
export class SetForumRulesUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_RULE_REPOSITORY)
    private readonly ruleRepo: IForumRuleRepository,
  ) {}

  async execute(
    forumId: string,
    rules: Array<{ title: string; body: string }>,
    userId: string,
  ): Promise<ForumRuleDomain[]> {
    const forum = await this.forumRepo.findById(forumId);
    if (!forum) throw new NotFoundException('Forum not found');
    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member || member.role !== 'owner') {
      throw new ForbiddenException('Only the owner can update forum rules');
    }
    return this.ruleRepo.setRules(forumId, rules);
  }
}
