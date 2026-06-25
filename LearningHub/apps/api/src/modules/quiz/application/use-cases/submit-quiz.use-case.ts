import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';

export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitQuizDto {
  answers: SubmitAnswerItem[];
}

export interface SubmitQuizResultDetail {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string | null;
}

export interface SubmitQuizResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  details: SubmitQuizResultDetail[];
}

@Injectable()
export class SubmitQuizUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(bankId: string, dto: SubmitQuizDto): Promise<SubmitQuizResult> {
    const bank = await this.questionBankRepository.findById(bankId);
    if (!bank) {
      throw new NotFoundException(`Question bank with id ${bankId} not found`);
    }

    // Lấy đầy đủ câu hỏi có đáp án (hideAnswers = false)
    const questions = await this.questionRepository.findByBankId(bankId, false);

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const details: SubmitQuizResultDetail[] = [];
    let correctCount = 0;

    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswerOptionIds.includes(answer.selectedOptionId);
      if (isCorrect) correctCount++;

      details.push({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
        correctOptionIds: question.correctAnswerOptionIds,
        explanation: question.explanation,
      });
    }

    const totalQuestions = dto.answers.length;
    const wrongCount = totalQuestions - correctCount;
    const scorePercent =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return { totalQuestions, correctCount, wrongCount, scorePercent, details };
  }
}
