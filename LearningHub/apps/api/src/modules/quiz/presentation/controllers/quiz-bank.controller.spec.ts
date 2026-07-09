/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizBankController } from './quiz-bank.controller';
import { CreateQuestionBankUseCase } from '../../application/use-cases/create-question-bank.use-case';
import { GetQuestionBankListUseCase } from '../../application/use-cases/get-question-bank-list.use-case';
import { GetQuestionsForQuizUseCase } from '../../application/use-cases/get-questions-for-quiz.use-case';
import { VerifyQuestionAnswerUseCase } from '../../application/use-cases/verify-question-answer.use-case';
import { GetQuestionBankDetailUseCase } from '../../application/use-cases/get-question-bank-detail.use-case';
import { UpdateQuestionBankUseCase } from '../../application/use-cases/update-question-bank.use-case';
import { DeleteQuestionBankUseCase } from '../../application/use-cases/delete-question-bank.use-case';
import { UpdateQuestionUseCase } from '../../application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/use-cases/delete-question.use-case';
import { UploadExcelUseCase } from '../../application/use-cases/upload-excel.use-case';
import { GetUploadHistoryUseCase } from '../../application/use-cases/get-upload-history.use-case';
import { CheckBankHashUseCase } from '../../application/use-cases/check-bank-hash.use-case';
import { GetDerivedBanksUseCase } from '../../application/use-cases/get-derived-banks.use-case';
import { UploadQuestionsUseCase } from '../../application/use-cases/upload-questions.use-case';
import { ParseExcelUseCase } from '../../application/use-cases/parse-excel.use-case';

const mockBank = { id: 'bank-1', title: 'Test Bank', totalQuestions: 5 };
const mockReq = { user: { id: 'user-1' } };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('QuizBankController', () => {
  let controller: QuizBankController;
  let getListUseCase: { execute: jest.Mock };
  let getDetailUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };
  let verifyUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizBankController],
      providers: [
        { provide: CreateQuestionBankUseCase, useValue: mockUseCase() },
        { provide: GetQuestionBankListUseCase, useValue: mockUseCase() },
        { provide: GetQuestionsForQuizUseCase, useValue: mockUseCase() },
        { provide: VerifyQuestionAnswerUseCase, useValue: mockUseCase() },
        { provide: GetQuestionBankDetailUseCase, useValue: mockUseCase() },
        { provide: UpdateQuestionBankUseCase, useValue: mockUseCase() },
        { provide: DeleteQuestionBankUseCase, useValue: mockUseCase() },
        { provide: UpdateQuestionUseCase, useValue: mockUseCase() },
        { provide: DeleteQuestionUseCase, useValue: mockUseCase() },
        { provide: UploadExcelUseCase, useValue: mockUseCase() },
        { provide: GetUploadHistoryUseCase, useValue: mockUseCase() },
        { provide: CheckBankHashUseCase, useValue: mockUseCase() },
        { provide: GetDerivedBanksUseCase, useValue: mockUseCase() },
        { provide: UploadQuestionsUseCase, useValue: mockUseCase() },
        { provide: ParseExcelUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<QuizBankController>(QuizBankController);
    getListUseCase = module.get(GetQuestionBankListUseCase);
    getDetailUseCase = module.get(GetQuestionBankDetailUseCase);
    updateUseCase = module.get(UpdateQuestionBankUseCase);
    deleteUseCase = module.get(DeleteQuestionBankUseCase);
    verifyUseCase = module.get(VerifyQuestionAnswerUseCase);
  });

  describe('GET /quiz/banks (TC031)', () => {
    it('TC031 — should return array of banks for authenticated user', async () => {
      getListUseCase.execute.mockResolvedValue([mockBank]);
      const result = await controller.getBankList(mockReq as any);
      expect(result).toEqual([mockBank]);
    });
  });

  describe('GET /quiz/banks/:id (TC032–TC033)', () => {
    it('TC032 — should return bank detail for valid id', async () => {
      getDetailUseCase.execute.mockResolvedValue(mockBank);
      const result = await controller.getBankDetail('bank-1');
      expect(result).toEqual(mockBank);
    });

    it('TC033 — should throw NotFoundException when bank id does not exist', async () => {
      getDetailUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.getBankDetail('999999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /quiz/banks/:id (TC034)', () => {
    it('TC034 — should return updated bank with valid data', async () => {
      const updated = { ...mockBank, title: 'Updated Title' };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.updateBank('bank-1', {
        title: 'Updated Title',
      } as any);
      expect(result).toEqual(updated);
      expect(updateUseCase.execute).toHaveBeenCalledWith(
        'bank-1',
        expect.objectContaining({ title: 'Updated Title' }),
      );
    });
  });

  describe('DELETE /quiz/banks/:id (TC035–TC036)', () => {
    it('TC035 — should delete own bank successfully', async () => {
      deleteUseCase.execute.mockResolvedValue({ deleted: true });
      const result = await controller.deleteBank('bank-1');
      expect(result).toEqual({ deleted: true });
    });

    it("TC036 — should throw ForbiddenException when deleting another user's bank", async () => {
      deleteUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(controller.deleteBank('bank-other')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('POST /quiz/questions/:id/verify (TC041–TC043)', () => {
    it('TC041 — should return isCorrect: true for a correct answer', async () => {
      verifyUseCase.execute.mockResolvedValue({
        isCorrect: true,
        correctOptionIds: ['opt-1'],
      });
      const result = await controller.verifyAnswer('q-1', {
        optionId: 'opt-1',
      } as any);
      expect((result as any).isCorrect).toBe(true);
    });

    it('TC042 — should return isCorrect: false for a wrong answer', async () => {
      verifyUseCase.execute.mockResolvedValue({
        isCorrect: false,
        correctOptionIds: ['opt-1'],
      });
      const result = await controller.verifyAnswer('q-1', {
        optionId: 'opt-2',
      } as any);
      expect((result as any).isCorrect).toBe(false);
    });

    it('TC043 — should throw NotFoundException for non-existent question', async () => {
      verifyUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.verifyAnswer('999999', { optionId: 'opt-1' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
