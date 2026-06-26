import {
  AnswerOptionInput,
  BankHashResult,
  CreateBankQuizParams,
  DerivedBank,
  GetBanksQuizParams,
  Question,
  QuestionBank,
  QuizAnswer,
  QuizResult,
  Tag,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
  UploadHistory,
  VerifyAnswerResult,
} from '@learning-hub/domain';
import { internalApi } from '../lib/api';

export type {
  AnswerOptionInput,
  BankHashResult,
  CreateBankQuizParams,
  DerivedBank,
  GetBanksQuizParams,
  Question,
  QuestionBank,
  QuizAnswer,
  QuizResult,
  Tag,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
  UploadHistory,
  VerifyAnswerResult,
};

interface UploadMessageResult { message: string; }
export interface ParsedQuestion {
  content: string;
  explanation?: string;
  answerOptions: AnswerOptionInput[];
  correctOptionLabels: string[];
}
export interface ParseExcelResponse { questions: ParsedQuestion[]; }

const QuizService = {
    getBanks: async (params?: GetBanksQuizParams) => {
        const response = await internalApi.get('quiz/banks', { params });
        return response.data;
    },

    getBankDetail: async (id: string): Promise<QuestionBank> => {
        const response = await internalApi.get(`quiz/banks/${id}`);
        return response.data.data;
    },

    createBank: async (data: CreateBankQuizParams): Promise<QuestionBank> => {
        const response = await internalApi.post('quiz/banks', data);
        return response.data.data;
    },

    updateBank: async (id: string, data: UpdateBankQuizParams): Promise<QuestionBank> => {
        const response = await internalApi.patch(`quiz/banks/${id}`, data);
        return response.data.data;
    },

    deleteBank: async (id: string): Promise<void> => {
        await internalApi.delete(`quiz/banks/${id}`);
    },

    uploadExcel: async (bankId: string, file: File, fileHash?: string): Promise<UploadMessageResult> => {
        const formData = new FormData();
        formData.append('file', file);
        if (fileHash) formData.append('fileHash', fileHash);
        const response = await internalApi.post(`quiz/banks/${bankId}/upload-excel`, formData);
        return response.data;
    },

    getUploadHistory: async (bankId: string): Promise<UploadHistory[]> => {
        const response = await internalApi.get(`quiz/banks/${bankId}/upload-history`);
        return response.data.data;
    },

    getQuestionsForQuiz: async (bankId: string, showAnswers = false): Promise<Question[]> => {
        const response = await internalApi.get(`quiz/banks/${bankId}/questions`, { params: showAnswers ? { showAnswers: 'true' } : undefined });
        return response.data.data;
    },

    verifyAnswer: async (questionId: string, selectedOptionId: string): Promise<VerifyAnswerResult> => {
        const response = await internalApi.post(`quiz/questions/${questionId}/verify`, { selectedOptionId });
        return { isCorrect: response.data.isCorrect, correctOptionId: response.data.correctOptionIds?.[0] };
    },

    submitQuiz: async (bankId: string, answers: QuizAnswer[]): Promise<QuizResult> => {
        const response = await internalApi.post(`quiz/banks/${bankId}/submit`, { answers });
        return response.data.data;
    },

    updateQuestion: async (id: string, data: UpdateQuestionQuizParams): Promise<Question> => {
        const response = await internalApi.patch(`quiz/questions/${id}`, data);
        return response.data.data;
    },

    deleteQuestion: async (id: string): Promise<void> => {
        await internalApi.delete(`quiz/questions/${id}`);
    },

    getTags: async (): Promise<Tag[]> => {
        const response = await internalApi.get('quiz/tags');
        return response.data.data;
    },

    createTag: async (name: string): Promise<Tag> => {
        const response = await internalApi.post('quiz/tags', { name });
        return response.data.data;
    },

    deleteTag: async (id: number): Promise<void> => {
        await internalApi.delete(`quiz/tags/${id}`);
    },

    parseExcel: async (bankId: string, file: File): Promise<ParseExcelResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await internalApi.post(`quiz/banks/${bankId}/parse-excel`, formData);
        return response.data;
    },

    getDerivedBanks: async (bankId: string): Promise<DerivedBank[]> => {
        const response = await internalApi.get(`quiz/banks/${bankId}/derived-banks`);
        return response.data.data;
    },

    checkHash: async (hash: string): Promise<BankHashResult> => {
        try {
            const response = await internalApi.get(`quiz/banks/check-hash/${hash}`);
            return response.data;
        } catch {
            return { exists: false };
        }
    },
};

export default QuizService;
