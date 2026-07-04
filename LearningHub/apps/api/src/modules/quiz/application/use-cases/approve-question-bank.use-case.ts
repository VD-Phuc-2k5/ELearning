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
export class ApproveQuestionBankUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async execute(
    bankId: string,
    adminId: string,
  ): Promise<{
    bank: QuestionBankDomain;
    duplicateBank: QuestionBankDomain | null;
  }> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId: adminId },
      relations: { role: true },
    });
    const isAdmin = userRoles.some(
      (ur) => ur.role?.code === 'ADMIN' || ur.role?.code === 'OWNER',
    );
    if (!isAdmin) {
      throw new ForbiddenException(
        'Chỉ admin mới có quyền duyệt ngân hàng câu hỏi.',
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
        'Chỉ có thể duyệt ngân hàng câu hỏi đang ở trạng thái chờ kiểm duyệt.',
      );
    }

    let duplicateBank: QuestionBankDomain | null = null;
    if (bank.fileHash) {
      const duplicate = await this.questionBankRepository.findByHash(
        bank.fileHash,
        undefined,
      );
      if (
        duplicate &&
        duplicate.id !== bankId &&
        duplicate.statusId === 'approved'
      ) {
        duplicateBank = duplicate;
      }
    }

    if (duplicateBank) {
      throw new BadRequestException(
        `File này đã tồn tại trong ngân hàng câu hỏi đã duyệt: "${duplicateBank.title}". Vui lòng kiểm tra lại.`,
      );
    }

    const updated = await this.questionBankRepository.update(bankId, {
      statusId: 'approved',
    });

    return { bank: updated, duplicateBank: null };
  }
}
