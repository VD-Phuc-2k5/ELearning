import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttemptEntity } from '../entities/quiz-attempt.entity';
import { QuizAttemptAnswerEntity } from '../entities/quiz-attempt-answer.entity';
import {
  IQuizAttemptRepository,
  CreateAttemptInput,
} from '../../../domain/repositories/quiz-attempt.repository.interface';
import {
  QuizAttemptAnswerDomain,
  QuizAttemptDomain,
} from '../../../domain/entities/quiz-attempt.domain';

@Injectable()
export class QuizAttemptRepository implements IQuizAttemptRepository {
  constructor(
    @InjectRepository(QuizAttemptEntity)
    private readonly repo: Repository<QuizAttemptEntity>,
  ) {}

  private toDomain(e: QuizAttemptEntity): QuizAttemptDomain {
    return {
      id: e.id,
      userId: e.userId,
      questionBankId: e.questionBankId,
      startedAt: e.startedAt,
      finishedAt: e.finishedAt,
      durationSeconds: e.durationSeconds,
      scorePercent: e.scorePercent !== null ? Number(e.scorePercent) : null,
      correctCount: e.correctCount,
      wrongCount: e.wrongCount,
      totalQuestions: e.totalQuestions,
      status: e.status as QuizAttemptDomain['status'],
      createdAt: e.createdAt,
    };
  }

  async create(input: CreateAttemptInput): Promise<QuizAttemptDomain> {
    return this.repo.manager.transaction(async (em) => {
      const attempt = em.create(QuizAttemptEntity, {
        userId: input.userId,
        questionBankId: input.questionBankId,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        durationSeconds: input.durationSeconds,
        scorePercent: input.scorePercent,
        correctCount: input.correctCount,
        wrongCount: input.wrongCount,
        totalQuestions: input.totalQuestions,
        status: input.status,
      });
      const saved = await em.save(attempt);
      const validAnswers = input.answers.filter(
        (a) => a.questionId && a.selectedOptionId,
      );
      if (validAnswers.length > 0) {
        const answerEntities = validAnswers.map((a, i) =>
          em.create(QuizAttemptAnswerEntity, {
            attemptId: saved.id,
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            isCorrect: a.isCorrect,
            questionOrder: a.questionOrder ?? i,
          }),
        );
        await em.save(answerEntities);
      }
      return this.toDomain(saved);
    });
  }

  async findByUser(
    userId: string,
    input: { page?: number; limit?: number; bankId?: string },
  ) {
    const { page = 1, limit = 10, bankId } = input;
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (bankId) qb.andWhere('a.questionBankId = :bankId', { bankId });
    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(this.toDomain.bind(this)), total };
  }

  async findById(id: string) {
    const e = await this.repo.findOne({
      where: { id },
      relations: { answers: { question: true, selectedOption: true } },
    });
    if (!e) return null;
    const answers: QuizAttemptAnswerDomain[] = (e.answers ?? []).map((a) => ({
      id: a.id,
      attemptId: a.attemptId,
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      isCorrect: a.isCorrect,
      timeSpentSeconds: a.timeSpentSeconds,
      questionOrder: a.questionOrder,
    }));
    return { ...this.toDomain(e), answers };
  }
}
