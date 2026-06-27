import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RoadmapItemEntity } from '../entities/roadmap-item.entity';
import {
  BankRoadmapItem,
  IRoadmapItemRepository,
} from '../../../domain/repositories/roadmap-item.repository.interface';
import { RoadmapItemDomain } from '../../../domain/entities/roadmap-item.domain';

@Injectable()
export class RoadmapItemRepository implements IRoadmapItemRepository {
  constructor(
    @InjectRepository(RoadmapItemEntity)
    private readonly repo: Repository<RoadmapItemEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(e: RoadmapItemEntity): RoadmapItemDomain {
    return {
      id: e.id,
      roadmapId: e.roadmapId,
      questionBankId: e.questionBankId,
      position: e.position,
      createdAt: e.createdAt,
      bankTitle: e.questionBank?.title,
      bankTotalQuestions: e.questionBank?.totalQuestions,
      bankStatus: e.questionBank?.statusId,
    };
  }

  async setItems(
    roadmapId: string,
    bankIds: string[],
  ): Promise<RoadmapItemDomain[]> {
    return this.dataSource.transaction(async (em) => {
      await em.delete(RoadmapItemEntity, { roadmapId });
      if (bankIds.length === 0) return [];
      const items = bankIds.map((bankId, i) =>
        em.create(RoadmapItemEntity, {
          roadmapId,
          questionBankId: bankId,
          position: i + 1,
        }),
      );
      await em.save(items);
      return this.findByRoadmapId(roadmapId);
    });
  }

  async findByRoadmapId(roadmapId: string): Promise<RoadmapItemDomain[]> {
    const items = await this.repo.find({
      where: { roadmapId },
      relations: { questionBank: true },
      order: { position: 'ASC' },
    });
    return items.map(this.toDomain.bind(this));
  }

  async findBankRoadmaps(bankId: string): Promise<BankRoadmapItem[]> {
    const rows = await this.repo
      .createQueryBuilder('ri')
      .leftJoin('ri.roadmap', 'r')
      .select(['ri.roadmapId', 'r.title', 'ri.position'])
      .where('ri.questionBankId = :bankId', { bankId })
      .getRawMany();
    return rows.map((r) => ({
      roadmapId: r.ri_roadmap_id,
      roadmapTitle: r.r_title,
      position: r.ri_position,
    }));
  }

  async removeItem(roadmapId: string, bankId: string): Promise<void> {
    await this.repo.delete({ roadmapId, questionBankId: bankId });
  }

  async countItems(roadmapId: string): Promise<number> {
    return this.repo.count({ where: { roadmapId } });
  }
}
