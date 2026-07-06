import {
  Inject,
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { CodingProblemDomain } from '../../domain/entities/coding-problem.domain';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class UpdateProblemUseCase {
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

  async execute(
    userId: string,
    problemId: string,
    params: Partial<
      Omit<CodingProblemDomain, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<CodingProblemDomain> {
    await this.checkAdmin(userId);

    const existing = await this.problemRepo.findById(problemId);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy đề bài để cập nhật');
    }

    const languages = params.languages ?? existing.languages;
    const templates = params.templates ?? existing.templates;
    const wrappers = params.wrappers ?? existing.wrappers;

    // Validate LeetCode-style templates and wrappers for all supported languages
    for (const lang of languages) {
      const template = templates?.[lang]?.trim();
      const wrapper = wrappers?.[lang]?.trim();

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

    return this.problemRepo.update(problemId, params);
  }
}
