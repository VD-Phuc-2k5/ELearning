import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { CodingProblemDomain } from '../../domain/entities/coding-problem.domain';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class CreateProblemUseCase {
  constructor(
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

  async execute(
    userId: string,
    params: Omit<
      CodingProblemDomain,
      'id' | 'creatorId' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<CodingProblemDomain> {
    await this.checkAdmin(userId);
    return this.problemRepo.create({
      ...params,
      creatorId: userId,
    });
  }
}
