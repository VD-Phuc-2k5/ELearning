import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  TEST_CASE_REPOSITORY,
  ITestCaseRepository,
} from '../../domain/repositories/test-case.repository.interface';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { TestCaseDomain } from '../../domain/entities/test-case.domain';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class ManageTestCasesUseCase {
  constructor(
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepo: ITestCaseRepository,
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  private async checkAdmin(userId: string): Promise<void> {
    const roles = await this.userRoleRepo.findByUserId(userId);
    const isAdmin = roles.some(
      (ur) => ur.role.code === 'ADMIN' || ur.role.code === 'OWNER',
    );
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only administrators can perform this action',
      );
    }
  }

  async createTestCase(
    userId: string,
    problemId: string,
    params: Omit<TestCaseDomain, 'id' | 'problemId' | 'createdAt'>,
  ): Promise<TestCaseDomain> {
    await this.checkAdmin(userId);
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new NotFoundException('Coding problem not found');

    return this.testCaseRepo.create({
      ...params,
      problemId,
    });
  }

  async getTestCases(
    userId: string,
    problemId: string,
  ): Promise<TestCaseDomain[]> {
    await this.checkAdmin(userId);
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new NotFoundException('Coding problem not found');

    return this.testCaseRepo.findByProblemId(problemId);
  }

  async deleteTestCase(userId: string, id: string): Promise<void> {
    await this.checkAdmin(userId);
    const testCase = await this.testCaseRepo.findById(id);
    if (!testCase) throw new NotFoundException('TestCase not found');

    await this.testCaseRepo.delete(id);
  }
}
