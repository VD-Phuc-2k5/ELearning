import type { ForumRuleDomain } from '../entities/forum-rule.domain';

export interface IForumRuleRepository {
  setRules(
    forumId: string,
    rules: Array<{ title: string; body: string }>,
  ): Promise<ForumRuleDomain[]>;
  findByForum(forumId: string): Promise<ForumRuleDomain[]>;
}

export const FORUM_RULE_REPOSITORY = Symbol('IForumRuleRepository');
