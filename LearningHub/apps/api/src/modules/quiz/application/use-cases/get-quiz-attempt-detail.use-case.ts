import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  IQuizAttemptRepository,
  QUIZ_ATTEMPT_REPOSITORY,
} from '../../domain/repositories/quiz-attempt.repository.interface';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';

@Injectable()
export class GetQuizAttemptDetailUseCase {
  constructor(
    @Inject(QUIZ_ATTEMPT_REPOSITORY)
    private readonly attemptRepo: IQuizAttemptRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
  ) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) throw new NotFoundException(`Attempt ${attemptId} not found`);
    if (attempt.userId !== userId)
      throw new ForbiddenException('Access denied');

    const questions = await this.questionRepo.findByBankId(
      attempt.questionBankId,
      false,
    );
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const reviewDetails = attempt.answers
      .map((a) => {
        const q = questionMap.get(a.questionId);
        return {
          questionId: a.questionId,
          questionContent: q?.content ?? '',
          explanation: q?.explanation ?? null,
          selectedOptionId: a.selectedOptionId,
          correctOptionIds: q?.correctAnswerOptionIds ?? [],
          isCorrect: a.isCorrect,
          questionOrder: a.questionOrder,
          answerOptions: q?.answerOptions ?? [],
        };
      })
      .sort((a, b) => a.questionOrder - b.questionOrder);

    return { attempt, reviewDetails };
  }
}
