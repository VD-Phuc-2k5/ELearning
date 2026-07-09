import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { CodingProblemDomain } from '../../domain/entities/coding-problem.domain';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class ListProblemsUseCase {
  constructor(
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(options?: {
    difficulty?: string;
    page?: number;
    limit?: number;
    status?: 'draft' | 'public';
  }): Promise<{ data: CodingProblemDomain[]; total: number }> {
    return this.problemRepo.findAll(options);
  }

  async getById(id: string, userId?: string): Promise<CodingProblemDomain> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) throw new NotFoundException('Coding problem not found');

    if (problem.status === 'draft' && userId) {
      const roles = await this.userRoleRepo.findByUserId(userId);
      const isAdmin = roles.some(
        (ur) => ur.role.code === 'ADMIN' || ur.role.code === 'OWNER',
      );
      if (!isAdmin) {
        throw new ForbiddenException(
          'You are not authorized to view this problem',
        );
      }
    }

    return problem;
  }
}
