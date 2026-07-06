import axios from 'axios';
import { handleAxiosError } from '@learning-hub/core';
import { getServerCookies } from '../../serverCookies';
import {
  CreateBankQuizParams,
  GetAttemptsParams,
  GetBanksQuizParams,
  QuizAnswer,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
} from '@learning-hub/domain';
import { IQuizRemoteDataSource } from './IQuizRemoteDataSource';

const NEST_API = `${process.env.NEST_API_URL || 'http://localhost:8080'}/api`;

export class QuizRemoteDataSourceImpl implements IQuizRemoteDataSource {
  private api = axios.create({
    baseURL: NEST_API,
    withCredentials: true,
  });

  constructor() {
    this.api.interceptors.request.use(async (config) => {
      config.headers.Cookie = await getServerCookies();
      return config;
    });
  }

  async getBanks(params: GetBanksQuizParams) {
    try {
      const res = await this.api.get('/quiz/banks', { params });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getBankDetail(id: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${id}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createBank(params: CreateBankQuizParams) {
    try {
      const res = await this.api.post('/quiz/banks', params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateBank(id: string, params: UpdateBankQuizParams) {
    try {
      const res = await this.api.patch(`/quiz/banks/${id}`, params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteBank(id: string) {
    try {
      await this.api.delete(`/quiz/banks/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    fileHash?: string,
  ) {
    try {
      const form = new FormData();
      form.append('file', new Blob([file as any]), fileName);
      if (fileHash) form.append('fileHash', fileHash);
      const res = await this.api.post(
        `/quiz/banks/${bankId}/upload-excel`,
        form,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async parseExcel(bankId: string, file: Buffer, fileName: string) {
    try {
      const form = new FormData();
      form.append('file', new Blob([file as any]), fileName);
      const res = await this.api.post(
        `/quiz/banks/${bankId}/parse-excel`,
        form,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getUploadHistory(bankId: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/upload-history`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getQuestionsForQuiz(bankId: string, showAnswers = false) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/questions`, {
        params: showAnswers ? { showAnswers: 'true' } : undefined,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async verifyAnswer(questionId: string, selectedOptionId: string) {
    try {
      const res = await this.api.post(`/quiz/questions/${questionId}/verify`, {
        selectedOptionId,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async submitQuiz(
    bankId: string,
    answers: QuizAnswer[],
    roadmapId?: string | null,
    durationSeconds?: number,
  ) {
    try {
      const res = await this.api.post(`/quiz/banks/${bankId}/submit`, {
        answers,
        roadmapId,
        durationSeconds,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getAttempts(params: GetAttemptsParams) {
    try {
      const res = await this.api.get('/quiz/attempts', { params });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getAttemptDetail(id: string) {
    try {
      const res = await this.api.get(`/quiz/attempts/${id}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getBankProgress(bankId: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/my-progress`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateQuestion(id: string, params: UpdateQuestionQuizParams) {
    try {
      const res = await this.api.patch(`/quiz/questions/${id}`, params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteQuestion(id: string) {
    try {
      await this.api.delete(`/quiz/questions/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getTags() {
    try {
      const res = await this.api.get('/quiz/tags');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createTag(name: string) {
    try {
      const res = await this.api.post('/quiz/tags', { name });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteTag(id: number) {
    try {
      await this.api.delete(`/quiz/tags/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async checkBankHash(hash: string) {
    try {
      const res = await this.api.get(`/quiz/banks/check-hash/${hash}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getDerivedBanks(bankId: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/derived-banks`);
      return res.data.data ?? [];
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getBankRoadmaps(bankId: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/roadmaps`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
