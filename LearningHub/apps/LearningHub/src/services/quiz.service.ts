import { internalApi } from '../lib/api';

export interface Tag {
    id: number;
    name: string;
    description?: string;
}

export interface QuestionBank {
    id: string;
    title: string;
    description: string;
    uploaderId: string;
    fileHash?: string;
    totalQuestions: number;
    statusId: string;
    tags?: Tag[];
    createdAt: string;
    updatedAt: string;
}

export interface AnswerOption {
    id: string;
    optionLabel: string;
    content: string;
}

export interface Question {
    id: string;
    content: string;
    explanation?: string;
    answerOptions: AnswerOption[];
}

export interface UploadHistory {
    id: string;
    questionBankId: string;
    uploadedBy: string;
    fileName?: string;
    totalQuestionsImported: number;
    createdAt: string;
}

export interface QuizResult {
    totalQuestions: number;
    correctCount: number;
    score: number;
    answers: { questionId: string; isCorrect: boolean; correctOptionId: string }[];
}

const QuizService = {
    getBanks: async (params?: { page?: number; limit?: number; search?: string; tagId?: number; statusId?: string }) => {
        const response = await internalApi.get('quiz/banks', { params });
        return response.data;
    },

    getBankDetail: async (id: string): Promise<QuestionBank> => {
        const response = await internalApi.get(`quiz/banks/${id}`);
        return response.data.data;
    },

    createBank: async (data: { title: string; description?: string; tagIds?: number[] }): Promise<QuestionBank> => {
        const response = await internalApi.post('quiz/banks', data);
        return response.data.data;
    },

    updateBank: async (id: string, data: { title?: string; description?: string; statusId?: string; tagIds?: number[] }): Promise<QuestionBank> => {
        const response = await internalApi.patch(`quiz/banks/${id}`, data);
        return response.data.data;
    },

    deleteBank: async (id: string): Promise<void> => {
        await internalApi.delete(`quiz/banks/${id}`);
    },

    uploadExcel: async (bankId: string, file: File, fileHash?: string): Promise<{ message: string }> => {
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

    getQuestionsForQuiz: async (bankId: string): Promise<Question[]> => {
        const response = await internalApi.get(`quiz/banks/${bankId}/questions`);
        return response.data.data;
    },

    verifyAnswer: async (questionId: string, selectedOptionId: string): Promise<{ isCorrect: boolean; correctOptionId?: string }> => {
        const response = await internalApi.post(`quiz/questions/${questionId}/verify`, { selectedOptionId });
        return response.data;
    },

    submitQuiz: async (bankId: string, answers: { questionId: string; selectedOptionId: string }[]): Promise<QuizResult> => {
        const response = await internalApi.post(`quiz/banks/${bankId}/submit`, { answers });
        return response.data.data;
    },

    updateQuestion: async (id: string, data: { content?: string; explanation?: string; answerOptions?: { optionLabel: string; content: string }[]; correctOptionLabels?: string[] }): Promise<Question> => {
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

    parseExcel: async (bankId: string, file: File): Promise<{ questions: any[] }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await internalApi.post(`quiz/banks/${bankId}/parse-excel`, formData);
        return response.data;
    },

    checkHash: async (hash: string): Promise<{ exists: boolean; bank?: QuestionBank }> => {
        try {
            const response = await internalApi.get(`quiz/banks/check-hash/${hash}`);
            return response.data;
        } catch {
            return { exists: false };
        }
    },
};

export default QuizService;
