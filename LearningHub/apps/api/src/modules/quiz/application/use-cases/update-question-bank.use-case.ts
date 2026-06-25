import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
  UpdateQuestionBankInput,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';

@Injectable()
export class UpdateQuestionBankUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateQuestionBankInput,
  ): Promise<QuestionBankDomain> {
    const bank = await this.questionBankRepository.findById(id);
    if (!bank) {
      throw new NotFoundException(`Không tìm thấy ngân hàng câu hỏi với ID: ${id}`);
    }

    if (dto.tagIds && dto.tagIds.length > 0) {
      const existingTags = await this.tagRepository.findByIds(dto.tagIds);
      if (existingTags.length !== dto.tagIds.length) {
        const existingIds = existingTags.map((t) => t.id);
        const missingIds = dto.tagIds.filter((id) => !existingIds.includes(id));
        throw new BadRequestException(`Không tìm thấy tag với ID: ${missingIds.join(', ')}`);
      }
    }

    return this.questionBankRepository.update(id, dto);
  }
}
