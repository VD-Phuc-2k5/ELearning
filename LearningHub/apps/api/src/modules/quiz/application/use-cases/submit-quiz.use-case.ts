import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  IQuizAttemptRepository,
  QUIZ_ATTEMPT_REPOSITORY,
} from '../../domain/repositories/quiz-attempt.repository.interface';
import {
  IUserBankProgressRepository,
  USER_BANK_PROGRESS_REPOSITORY,
} from '../../domain/repositories/user-bank-progress.repository.interface';
import {
  IRoadmapItemRepository,
  ROADMAP_ITEM_REPOSITORY,
} from '../../../roadmap/domain/repositories/roadmap-item.repository.interface';
import {
  IUserRoadmapProgressRepository,
  USER_ROADMAP_PROGRESS_REPOSITORY,
} from '../../../roadmap/domain/repositories/user-roadmap-progress.repository.interface';
import {
  SubmitQuizDto,
  SubmitQuizResult,
  SubmitQuizResultDetail,
  NextBankSuggestion,
} from '../dto/submit-quiz.dto';

export type {
  SubmitAnswerItem,
  SubmitQuizDto,
  SubmitQuizResultDetail,
  NextBankSuggestion,
  SubmitQuizResult,
} from '../dto/submit-quiz.dto';

@Injectable()
export class SubmitQuizUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(QUIZ_ATTEMPT_REPOSITORY)
    private readonly attemptRepository: IQuizAttemptRepository,
    @Inject(USER_BANK_PROGRESS_REPOSITORY)
    private readonly bankProgressRepository: IUserBankProgressRepository,
    @Inject(ROADMAP_ITEM_REPOSITORY)
    private readonly roadmapItemRepository: IRoadmapItemRepository,
    @Inject(USER_ROADMAP_PROGRESS_REPOSITORY)
    private readonly roadmapProgressRepository: IUserRoadmapProgressRepository,
  ) {}

  async execute(
    bankId: string,
    dto: SubmitQuizDto,
    userId: string,
  ): Promise<SubmitQuizResult> {
    const bank = await this.questionBankRepository.findById(bankId);
    if (!bank) throw new NotFoundException(`Question bank ${bankId} not found`);

    const questions = await this.questionRepository.findByBankId(bankId, false);
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const details: SubmitQuizResultDetail[] = [];
    let correctCount = 0;
    const startedAt = new Date();

    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;
      const isCorrect = question.correctAnswerOptionIds.includes(
        answer.selectedOptionId,
      );
      if (isCorrect) correctCount++;
      details.push({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
        correctOptionIds: question.correctAnswerOptionIds,
        explanation: question.explanation,
      });
    }

    const totalQuestions = questions.length;
    const wrongCount = totalQuestions - correctCount;
    const scorePercent =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const passingScore = bank.passingScore;
    const status: 'pass' | 'fail' =
      scorePercent >= passingScore ? 'pass' : 'fail';
    const finishedAt = new Date();
    const durationSeconds =
      dto.durationSeconds ??
      Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000);

    const attempt = await this.attemptRepository.create({
      userId,
      questionBankId: bankId,
      startedAt,
      finishedAt,
      durationSeconds,
      scorePercent,
      correctCount,
      wrongCount,
      totalQuestions,
      status,
      answers: dto.answers.map((a, i) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
        isCorrect:
          questionMap
            .get(a.questionId)
            ?.correctAnswerOptionIds.includes(a.selectedOptionId) ?? false,
        questionOrder: i,
      })),
    });

    await this.bankProgressRepository.upsertAfterAttempt({
      userId,
      questionBankId: bankId,
      scorePercent,
      passingScore,
      attemptedAt: finishedAt,
    });

    // Auto-sync all roadmaps that contain this bank, not just the explicitly selected one
    const bankRoadmaps =
      await this.roadmapItemRepository.findBankRoadmaps(bankId);
    const roadmapIds = [
      ...new Set([
        ...bankRoadmaps.map((r) => r.roadmapId),
        ...(dto.roadmapId ? [dto.roadmapId] : []),
      ]),
    ];

    let nextBank: NextBankSuggestion | null = null;
    for (const roadmapId of roadmapIds) {
      const next = await this.updateRoadmapProgress(
        roadmapId,
        userId,
        bankId,
        scorePercent,
        passingScore,
      );
      if (roadmapId === dto.roadmapId) nextBank = next;
      else if (!nextBank && !dto.roadmapId) nextBank = next;
    }

    return {
      totalQuestions,
      correctCount,
      wrongCount,
      scorePercent,
      details,
      attemptId: attempt.id,
      nextBank,
    };
  }

  private async updateRoadmapProgress(
    roadmapId: string,
    userId: string,
    justCompletedBankId: string,
    scorePercent: number,
    passingScore: number,
  ): Promise<NextBankSuggestion | null> {
    const items = await this.roadmapItemRepository.findByRoadmapId(roadmapId);
    if (!items.length) return null;

    const bankIds = items.map((i) => i.questionBankId);
    const completedIds = new Set(
      await this.bankProgressRepository.findCompletedBankIds(userId, bankIds),
    );
    if (scorePercent >= passingScore) completedIds.add(justCompletedBankId);

    const completedBanks = completedIds.size;
    const totalBanks = items.length;
    const progressPercent =
      totalBanks > 0 ? Math.round((completedBanks / totalBanks) * 100) : 0;
    const allDone = completedBanks >= totalBanks;

    await this.roadmapProgressRepository.upsert({
      userId,
      roadmapId,
      totalBanks,
      completedBanks,
      progressPercent,
      status: allDone ? 'completed' : 'in_progress',
      lastAccessedBankId: justCompletedBankId,
      completedAt: allDone ? new Date() : null,
    });

    const nextItem = items.find((i) => !completedIds.has(i.questionBankId));
    if (!nextItem) return null;
    return {
      bankId: nextItem.questionBankId,
      bankTitle: nextItem.bankTitle ?? '',
      position: nextItem.position,
      totalBanks,
      roadmapId,
    };
  }
}
