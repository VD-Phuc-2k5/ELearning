import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISubmissionRepository } from '../../../domain/repositories/submission.repository.interface';
import { SubmissionEntity } from '../entities/submission.entity';
import { SubmissionResultEntity } from '../entities/submission-result.entity';
import {
  SubmissionDomain,
  SubmissionStatus,
} from '../../../domain/entities/submission.domain';
import { SubmissionResultDomain } from '../../../domain/entities/submission-result.domain';

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly repo: Repository<SubmissionEntity>,
  ) {}

  private toDomain(entity: SubmissionEntity): SubmissionDomain {
    return {
      id: entity.id,
      userId: entity.userId,
      problemId: entity.problemId,
      language: entity.language,
      sourceCode: entity.sourceCode,
      status: entity.status as SubmissionStatus,
      score: entity.score,
      totalTestCases: entity.totalTestCases,
      passedTestCases: entity.passedTestCases,
      executionTimeMs: entity.executionTimeMs,
      memoryUsedKb: entity.memoryUsedKb,
      errorMessage: entity.errorMessage,
      submittedAt: entity.submittedAt,
      judgedAt: entity.judgedAt,
      results: entity.results?.map((r) => ({
        id: r.id,
        submissionId: r.submissionId,
        testCaseId: r.testCaseId,
        status: r.status as SubmissionResultDomain['status'],
        actualOutput: r.actualOutput,
        executionTimeMs: r.executionTimeMs,
        memoryUsedKb: r.memoryUsedKb,
        errorMessage: r.errorMessage,
        createdAt: r.createdAt,
        testCase: r.testCase
          ? {
              id: r.testCase.id,
              problemId: r.testCase.problemId,
              input: r.testCase.input,
              expectedOutput: r.testCase.expectedOutput,
              isHidden: r.testCase.isHidden,
              orderIndex: r.testCase.orderIndex,
              points: r.testCase.points,
              createdAt: r.testCase.createdAt,
            }
          : undefined,
      })),
    };
  }

  async create(
    submission: Omit<
      SubmissionDomain,
      | 'id'
      | 'status'
      | 'score'
      | 'totalTestCases'
      | 'passedTestCases'
      | 'executionTimeMs'
      | 'memoryUsedKb'
      | 'errorMessage'
      | 'submittedAt'
      | 'judgedAt'
    >,
  ): Promise<SubmissionDomain> {
    const entity = this.repo.create(submission);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus,
    errorMessage?: string | null,
  ): Promise<void> {
    await this.repo.update(id, {
      status,
      errorMessage: errorMessage ?? null,
      ...(status === 'running' ? {} : { judgedAt: new Date() }),
    });
  }

  async updateResult(
    id: string,
    params: {
      status: SubmissionStatus;
      score: number;
      passedTestCases: number;
      totalTestCases: number;
      executionTimeMs: number | null;
      memoryUsedKb: number | null;
      errorMessage: string | null;
      results: Omit<
        SubmissionResultDomain,
        'id' | 'submissionId' | 'createdAt'
      >[];
    },
  ): Promise<SubmissionDomain> {
    return this.repo.manager.transaction(async (manager) => {
      await manager.update(SubmissionEntity, id, {
        status: params.status,
        score: params.score,
        passedTestCases: params.passedTestCases,
        totalTestCases: params.totalTestCases,
        executionTimeMs: params.executionTimeMs,
        memoryUsedKb: params.memoryUsedKb,
        errorMessage: params.errorMessage,
        judgedAt: new Date(),
      });

      await manager.delete(SubmissionResultEntity, { submissionId: id });

      const resultsEntities = params.results.map((r) =>
        manager.create(SubmissionResultEntity, {
          ...r,
          submissionId: id,
        }),
      );
      await manager.save(resultsEntities);

      const updated = await manager.findOne(SubmissionEntity, {
        where: { id },
        relations: { results: { testCase: true } },
      });
      if (!updated) {
        throw new Error(
          `Submission with id ${id} not found after result update`,
        );
      }
      return this.toDomain(updated);
    });
  }

  async findById(id: string): Promise<SubmissionDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { results: { testCase: true } },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserIdAndProblemId(
    userId: string,
    problemId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ data: SubmissionDomain[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [entities, total] = await this.repo.findAndCount({
      where: { userId, problemId },
      order: { submittedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: entities.map((e) => this.toDomain(e)),
      total,
    };
  }
}
