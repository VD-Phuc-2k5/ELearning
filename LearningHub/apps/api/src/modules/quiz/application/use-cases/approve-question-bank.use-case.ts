import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';
import { UserRoleEntity } from '../../../auth/infrastructure/persistence/entities/user-role.entity';
import {
  IForumNotificationRepository,
  FORUM_NOTIFICATION_REPOSITORY,
  CreateNotificationInput,
} from '../../../forum/domain/repositories/forum-notification.repository.interface';
import {
  IForumGateway,
  FORUM_GATEWAY,
} from '../../../forum/application/interfaces/i-forum-gateway';

@Injectable()
export class ApproveQuestionBankUseCase {
  private readonly logger = new Logger(ApproveQuestionBankUseCase.name);

  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: IForumNotificationRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
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

    const updated = await this.questionBankRepository.update(bankId, {
      statusId: 'approved',
    });

    try {
      const input: CreateNotificationInput = {
        recipientId: bank.uploaderId,
        actorId: adminId,
        type: 'bank_approved',
        targetType: 'question_bank',
        targetId: bankId,
        metadata: {
          bankTitle: bank.title,
        },
      };
      const notification = await this.notificationRepo.create(input);
      this.gateway.emitNotification(bank.uploaderId, notification);
    } catch (err) {
      this.logger.error(
        `Failed to send approval notification for bank ${bankId}`,
        (err as Error).stack,
      );
    }

    this.gateway.emitBankReviewed(
      {
        bankId,
        action: 'approved',
        actorId: adminId,
      },
      bank.uploaderId,
    );

    return { bank: updated, duplicateBank: null };
  }
}
