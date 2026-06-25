import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
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
  ) {}

  async execute(
    dto: CreateQuestionBankDto,
    uploaderId: string,
  ): Promise<QuestionBankDomain> {
    return this.questionBankRepository.create({
      title: dto.title,
      description: dto.description,
      uploaderId,
      tagIds: dto.tagIds,
    });
  }
}
