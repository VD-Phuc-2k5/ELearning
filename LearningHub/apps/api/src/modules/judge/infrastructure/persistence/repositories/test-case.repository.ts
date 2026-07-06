import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITestCaseRepository } from '../../../domain/repositories/test-case.repository.interface';
import { TestCaseEntity } from '../entities/test-case.entity';
import { TestCaseDomain } from '../../../domain/entities/test-case.domain';

@Injectable()
export class TestCaseRepository implements ITestCaseRepository {
  constructor(
    @InjectRepository(TestCaseEntity)
    private readonly repo: Repository<TestCaseEntity>,
  ) {}

  private toDomain(entity: TestCaseEntity): TestCaseDomain {
    return {
      id: entity.id,
      problemId: entity.problemId,
      input: entity.input,
      expectedOutput: entity.expectedOutput,
      isHidden: entity.isHidden,
      orderIndex: entity.orderIndex,
      points: entity.points,
      createdAt: entity.createdAt,
    };
  }

  async create(
    testCase: Omit<TestCaseDomain, 'id' | 'createdAt'>,
  ): Promise<TestCaseDomain> {
    const entity = this.repo.create(testCase);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    testCase: Partial<Omit<TestCaseDomain, 'id' | 'problemId' | 'createdAt'>>,
  ): Promise<TestCaseDomain> {
    await this.repo.update(id, testCase);
    const updated = await this.repo.findOneBy({ id });
    if (!updated) {
      throw new Error(`TestCase with id ${id} not found after update`);
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findById(id: string): Promise<TestCaseDomain | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProblemId(problemId: string): Promise<TestCaseDomain[]> {
    const entities = await this.repo.find({
      where: { problemId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }
}
