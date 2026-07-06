import {
  Inject,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

    // Validate LeetCode-style templates and wrappers for all supported languages
    for (const lang of params.languages) {
      const template = params.templates?.[lang]?.trim();
      const wrapper = params.wrappers?.[lang]?.trim();

      if (!template) {
        throw new BadRequestException(
          `Ngôn ngữ ${lang.toUpperCase()}: Bắt buộc phải có Mẫu Code học sinh nhìn thấy`,
        );
      }
      if (!wrapper) {
        throw new BadRequestException(
          `Ngôn ngữ ${lang.toUpperCase()}: Bắt buộc phải có Mã bọc chạy chấm điểm (Driver Code)`,
        );
      }
      if (!wrapper.includes('{{STUDENT_CODE}}')) {
        throw new BadRequestException(
          `Ngôn ngữ ${lang.toUpperCase()}: Mã bọc chạy (Driver Code) bắt buộc phải chứa placeholder {{STUDENT_CODE}}`,
        );
      }
    }

    return this.problemRepo.create({
      ...params,
      creatorId: userId,
    });
  }
}
