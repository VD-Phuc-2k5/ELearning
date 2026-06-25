import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
  UpdateQuestionInput,
} from '../../domain/repositories/question.repository.interface';
import { QuestionDomain } from '../../domain/entities/question.domain';

@Injectable()
export class UpdateQuestionUseCase {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateQuestionInput,
  ): Promise<QuestionDomain> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${id}`);
    }

    return this.questionRepository.update(id, dto);
  }
}
