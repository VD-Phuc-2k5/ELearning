import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  SUBMISSION_REPOSITORY,
  ISubmissionRepository,
} from '../../domain/repositories/submission.repository.interface';
import { SubmissionDomain } from '../../domain/entities/submission.domain';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class GetSubmissionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepo: ISubmissionRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(userId: string, id: string): Promise<SubmissionDomain> {
    const submission = await this.submissionRepo.findById(id);
    if (!submission) throw new NotFoundException('Submission not found');

    const roles = await this.userRoleRepo.findByUserId(userId);
    const isAdmin = roles.some(
      (ur) => ur.role.code === 'ADMIN' || ur.role.code === 'OWNER',
    );

    if (submission.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to view this submission',
      );
    }

    // Nếu không phải là ADMIN/OWNER, lọc ẩn toàn bộ thông tin nhạy cảm của test case ẩn
    if (!isAdmin && submission.results) {
      submission.results = submission.results.map((res) => {
        if (res.testCase?.isHidden) {
          return {
            ...res,
            actualOutput: null,
            errorMessage: null,
            testCase: {
              ...res.testCase,
              input: '',
              expectedOutput: '',
            },
          };
        }
        return res;
      });
    }

    return submission;
  }
}
