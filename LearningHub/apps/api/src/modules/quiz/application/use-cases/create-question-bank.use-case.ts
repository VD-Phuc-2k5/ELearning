import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';

export interface CreateQuestionBankDto {
  title: string;
  description?: string;
  tagIds?: number[];
}

@Injectable()
export class CreateQuestionBankUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(
    dto: CreateQuestionBankDto,
    uploaderId: string,
  ): Promise<QuestionBankDomain> {
    if (dto.tagIds && dto.tagIds.length > 0) {
      const existingTags = await this.tagRepository.findByIds(dto.tagIds);
      if (existingTags.length !== dto.tagIds.length) {
        const existingIds = existingTags.map((t) => t.id);
        const missingIds = dto.tagIds.filter((id) => !existingIds.includes(id));
        throw new BadRequestException(`Không tìm thấy tag với ID: ${missingIds.join(', ')}`);
      }
    }

    return this.questionBankRepository.create({
      title: dto.title,
      description: dto.description,
      uploaderId,
      tagIds: dto.tagIds,
    });
  }
}
