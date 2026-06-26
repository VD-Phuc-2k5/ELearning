import { Inject, Injectable } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';

export interface GetQuestionBankListDto {
  page?: number;
  limit?: number;
  search?: string;
  tagId?: number;
  statusId?: string;
  uploaderId?: string;
}

@Injectable()
export class GetQuestionBankListUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(
    dto: GetQuestionBankListDto,
  ): Promise<{
    data: QuestionBankDomain[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const { data, total } = await this.questionBankRepository.findAll({
      ...dto,
      page,
      limit,
    });
    return { data, total, page, limit };
  }
}
