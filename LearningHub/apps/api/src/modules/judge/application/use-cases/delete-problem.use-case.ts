import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class DeleteProblemUseCase {
  constructor(
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  private async checkAdmin(userId: string) {
    const roles = await this.userRoleRepo.findByUserId(userId);
    const isAdmin = roles.some(
      (r) => r.role.code === 'ADMIN' || r.role.code === 'OWNER',
    );
    if (!isAdmin) {
      throw new ForbiddenException(
        'Chỉ ADMIN mới có quyền thực hiện hành động này',
      );
    }
  }

  async execute(userId: string, problemId: string): Promise<void> {
    await this.checkAdmin(userId);
    await this.problemRepo.delete(problemId);
  }
}
