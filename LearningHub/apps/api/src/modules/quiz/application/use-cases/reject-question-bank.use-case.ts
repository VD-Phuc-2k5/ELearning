import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';
import { UserRoleEntity } from '../../../auth/infrastructure/persistence/entities/user-role.entity';

@Injectable()
export class RejectQuestionBankUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async execute(bankId: string, adminId: string): Promise<QuestionBankDomain> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId: adminId },
      relations: { role: true },
    });
    const isAdmin = userRoles.some(
      (ur) => ur.role?.code === 'ADMIN' || ur.role?.code === 'OWNER',
    );
    if (!isAdmin) {
      throw new ForbiddenException(
        'Chỉ admin mới có quyền từ chối ngân hàng câu hỏi.',
      );
    }

    const bank = await this.questionBankRepository.findById(bankId);
    if (!bank) {
      throw new NotFoundException(
        `Không tìm thấy ngân hàng câu hỏi với ID: ${bankId}`,
      );
    }

    if (bank.statusId !== 'pending_review') {
      throw new BadRequestException(
        'Chỉ có thể từ chối ngân hàng câu hỏi đang ở trạng thái chờ kiểm duyệt.',
      );
    }

    return this.questionBankRepository.update(bankId, { statusId: 'draft' });
  }
}
