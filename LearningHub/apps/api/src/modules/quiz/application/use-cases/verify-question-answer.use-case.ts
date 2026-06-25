import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';

export interface VerifyQuestionAnswerDto {
  selectedOptionId: string;
}

export interface VerifyQuestionAnswerResult {
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string | null;
}

@Injectable()
export class VerifyQuestionAnswerUseCase {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(
    questionId: string,
    dto: VerifyQuestionAnswerDto,
  ): Promise<VerifyQuestionAnswerResult> {
    // hideAnswers = false -> trả đầy đủ bao gồm đáp án đúng và giải thích
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    const isCorrect = question.correctAnswerOptionIds.includes(dto.selectedOptionId);

    return {
      isCorrect,
      correctOptionIds: question.correctAnswerOptionIds,
      explanation: question.explanation,
    };
  }
}
