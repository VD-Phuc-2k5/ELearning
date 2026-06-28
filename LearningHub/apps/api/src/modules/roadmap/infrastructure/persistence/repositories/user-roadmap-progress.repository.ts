import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoadmapProgressEntity } from '../entities/user-roadmap-progress.entity';
import {
  IUserRoadmapProgressRepository,
  UpsertRoadmapProgressInput,
} from '../../../domain/repositories/user-roadmap-progress.repository.interface';
import {
  UserRoadmapProgressDomain,
  RoadmapProgressStatus,
} from '../../../domain/entities/user-roadmap-progress.domain';

@Injectable()
export class UserRoadmapProgressRepository
  implements IUserRoadmapProgressRepository
{
  constructor(
    @InjectRepository(UserRoadmapProgressEntity)
    private readonly repo: Repository<UserRoadmapProgressEntity>,
  ) {}

  private toDomain(e: UserRoadmapProgressEntity): UserRoadmapProgressDomain {
    return {
      id: e.id,
      userId: e.userId,
      roadmapId: e.roadmapId,
      roadmapTitle: e.roadmap?.title,
      totalBanks: Number(e.totalBanks),
      completedBanks: Number(e.completedBanks),
      progressPercent: Number(e.progressPercent),
      status: e.status as RoadmapProgressStatus,
      currentBankId: e.currentBankId,
      lastAccessedBankId: e.lastAccessedBankId,
      startedAt: e.startedAt,
      lastAccessedAt: e.lastAccessedAt,
      completedAt: e.completedAt,
    };
  }

  async upsert(
    input: UpsertRoadmapProgressInput,
  ): Promise<UserRoadmapProgressDomain> {
    const existing = await this.repo.findOne({
      where: { userId: input.userId, roadmapId: input.roadmapId },
    });

    const now = new Date();
    if (existing) {
      Object.assign(existing, {
        totalBanks: input.totalBanks,
        completedBanks: input.completedBanks,
        progressPercent: input.progressPercent,
        status: input.status,
        lastAccessedAt: now,
        ...(input.currentBankId !== undefined && {
          currentBankId: input.currentBankId,
        }),
        ...(input.lastAccessedBankId !== undefined && {
          lastAccessedBankId: input.lastAccessedBankId,
        }),
        ...(input.completedAt !== undefined && {
          completedAt: input.completedAt,
        }),
      });
      return this.toDomain(await this.repo.save(existing));
    }

    const entity = this.repo.create({
      userId: input.userId,
      roadmapId: input.roadmapId,
      totalBanks: input.totalBanks,
      completedBanks: input.completedBanks,
      progressPercent: input.progressPercent,
      status: input.status,
      currentBankId: input.currentBankId ?? null,
      lastAccessedBankId: input.lastAccessedBankId ?? null,
      startedAt: input.startedAt ?? now,
      lastAccessedAt: now,
      completedAt: input.completedAt ?? null,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapProgressDomain | null> {
    const e = await this.repo.findOne({ where: { userId, roadmapId } });
    return e ? this.toDomain(e) : null;
  }

  async findAllByUser(userId: string): Promise<UserRoadmapProgressDomain[]> {
    const rows = await this.repo.find({
      where: { userId },
      relations: { roadmap: true },
      order: { lastAccessedAt: 'DESC' },
    });
    return rows.map(this.toDomain.bind(this));
  }

  async findAllByRoadmap(
    roadmapId: string,
  ): Promise<UserRoadmapProgressDomain[]> {
    const rows = await this.repo.find({ where: { roadmapId } });
    return rows.map(this.toDomain.bind(this));
  }
}
