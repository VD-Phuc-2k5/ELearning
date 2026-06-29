import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ForumRuleEntity } from '../entities/forum-rule.entity';
import { IForumRuleRepository } from '../../../domain/repositories/forum-rule.repository.interface';
import type { ForumRuleDomain } from '../../../domain/entities/forum-rule.domain';

@Injectable()
export class ForumRuleRepository implements IForumRuleRepository {
  constructor(
    @InjectRepository(ForumRuleEntity)
    private readonly repo: Repository<ForumRuleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(e: ForumRuleEntity): ForumRuleDomain {
    return {
      id: e.id,
      forumId: e.forumId,
      title: e.title,
      body: e.body,
      order: e.order,
    };
  }

  async setRules(
    forumId: string,
    rules: Array<{ title: string; body: string }>,
  ): Promise<ForumRuleDomain[]> {
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(ForumRuleEntity, { forumId });
      if (rules.length === 0) return [];
      const entities = rules.map((r, i) =>
        manager.create(ForumRuleEntity, {
          forumId,
          title: r.title,
          body: r.body,
          order: i,
        }),
      );
      const saved = await manager.save(ForumRuleEntity, entities);
      return saved.map(this.toDomain);
    });
  }

  async findByForum(forumId: string): Promise<ForumRuleDomain[]> {
    const entities = await this.repo.find({
      where: { forumId },
      order: { order: 'ASC' },
    });
    return entities.map(this.toDomain);
  }
}
