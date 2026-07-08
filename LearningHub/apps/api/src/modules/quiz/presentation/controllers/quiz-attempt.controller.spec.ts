import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuizAttemptController } from './quiz-attempt.controller';
import { SubmitQuizUseCase } from '../../application/use-cases/submit-quiz.use-case';
import { GetQuizAttemptsUseCase } from '../../application/use-cases/get-quiz-attempts.use-case';
import { GetQuizAttemptDetailUseCase } from '../../application/use-cases/get-quiz-attempt-detail.use-case';
import { GetBankProgressUseCase } from '../../application/use-cases/get-bank-progress.use-case';
import { GetBankRoadmapsUseCase } from '../../application/use-cases/get-bank-roadmaps.use-case';

const mockReq = { user: { id: 'user-1' } };
const mockFn = () => ({ execute: jest.fn() });

describe('QuizAttemptController', () => {
  let controller: QuizAttemptController;
  let submitUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizAttemptController],
      providers: [
        { provide: SubmitQuizUseCase, useValue: mockFn() },
        { provide: GetQuizAttemptsUseCase, useValue: mockFn() },
        { provide: GetQuizAttemptDetailUseCase, useValue: mockFn() },
        { provide: GetBankProgressUseCase, useValue: mockFn() },
        { provide: GetBankRoadmapsUseCase, useValue: mockFn() },
      ],
    }).compile();

    controller = module.get<QuizAttemptController>(QuizAttemptController);
    submitUseCase = module.get(SubmitQuizUseCase);
  });

  describe('POST /quiz/banks/:id/submit (TC037–TC040)', () => {
    const answers = [
      { questionId: 'q-1', selectedOptionId: 'opt-1' },
      { questionId: 'q-2', selectedOptionId: 'opt-2' },
    ];

    it('TC037 — should return score=100 and passed=true when all answers correct', async () => {
      submitUseCase.execute.mockResolvedValue({
        score: 100,
        passed: true,
        correctCount: 2,
        totalQuestions: 2,
      });

      const result = await controller.submitQuiz(
        'bank-1',
        { answers } as any,
        mockReq as any,
      );

      expect((result as any).score).toBe(100);
      expect((result as any).passed).toBe(true);
    });

    it('TC038 — should return score=0 and passed=false when all answers wrong', async () => {
      submitUseCase.execute.mockResolvedValue({
        score: 0,
        passed: false,
        correctCount: 0,
        totalQuestions: 2,
      });

      const result = await controller.submitQuiz(
        'bank-1',
        { answers } as any,
        mockReq as any,
      );

      expect((result as any).score).toBe(0);
      expect((result as any).passed).toBe(false);
    });

    it('TC040 — should throw NotFoundException when bankId does not exist', async () => {
      submitUseCase.execute.mockRejectedValue(new NotFoundException());

      await expect(
        controller.submitQuiz('999999', { answers } as any, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('delegates bankId and userId to use case', async () => {
      submitUseCase.execute.mockResolvedValue({ score: 80, passed: true });
      await controller.submitQuiz('bank-1', { answers } as any, mockReq as any);
      expect(submitUseCase.execute).toHaveBeenCalledWith(
        'bank-1',
        expect.any(Object),
        'user-1',
      );
    });
  });
});
