import axios from 'axios';
import {
  AuthenticationException,
  NetworkException,
  NotFoundException,
  PermissionException,
  UnknownException,
} from '@learning-hub/core';
import {
  BankRoadmapItem,
  CreateBankQuizParams,
  GetAttemptsParams,
  GetBanksQuizParams,
  QuizAnswer,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
} from '@learning-hub/domain';
import { IQuizRemoteDataSource } from './IQuizRemoteDataSource';

const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';

export class QuizRemoteDataSourceImpl implements IQuizRemoteDataSource {
  private api = axios.create({ baseURL: NEST_API });

  private auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private handleError(e: unknown): never {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      const message: string = e.response?.data?.message || e.message;
      if (status === 401) throw new AuthenticationException(message);
      if (status === 403) throw new PermissionException(message);
      if (status === 404) throw new NotFoundException(message);
      throw new UnknownException();
    }
    throw new NetworkException();
  }

  async getBanks(params: GetBanksQuizParams, token: string) {
    try {
      const res = await this.api.get('/quiz/banks', {
        params,
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getBankDetail(id: string, token: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${id}`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async createBank(params: CreateBankQuizParams, token: string) {
    try {
      const res = await this.api.post('/quiz/banks', params, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async updateBank(id: string, params: UpdateBankQuizParams, token: string) {
    try {
      const res = await this.api.patch(`/quiz/banks/${id}`, params, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteBank(id: string, token: string) {
    try {
      await this.api.delete(`/quiz/banks/${id}`, {
        headers: this.auth(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    token: string,
    fileHash?: string,
  ) {
    try {
      const form = new FormData();
      form.append('file', new Blob([file]), fileName);
      if (fileHash) form.append('fileHash', fileHash);
      const res = await this.api.post(
        `/quiz/banks/${bankId}/upload-excel`,
        form,
        { headers: { ...this.auth(token) } },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    token: string,
  ) {
    try {
      const form = new FormData();
      form.append('file', new Blob([file]), fileName);
      const res = await this.api.post(
        `/quiz/banks/${bankId}/parse-excel`,
        form,
        { headers: { ...this.auth(token) } },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getUploadHistory(bankId: string, token: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/upload-history`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getQuestionsForQuiz(
    bankId: string,
    token: string,
    showAnswers = false,
  ) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/questions`, {
        headers: this.auth(token),
        params: showAnswers ? { showAnswers: 'true' } : undefined,
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async verifyAnswer(
    questionId: string,
    selectedOptionId: string,
    token: string,
  ) {
    try {
      const res = await this.api.post(
        `/quiz/questions/${questionId}/verify`,
        { selectedOptionId },
        { headers: this.auth(token) },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async submitQuiz(
    bankId: string,
    answers: QuizAnswer[],
    token: string,
    roadmapId?: string | null,
    durationSeconds?: number,
  ) {
    try {
      const res = await this.api.post(
        `/quiz/banks/${bankId}/submit`,
        { answers, roadmapId, durationSeconds },
        { headers: this.auth(token) },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getAttempts(params: GetAttemptsParams, token: string) {
    try {
      const res = await this.api.get('/quiz/attempts', {
        params,
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getAttemptDetail(id: string, token: string) {
    try {
      const res = await this.api.get(`/quiz/attempts/${id}`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getBankProgress(bankId: string, token: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/my-progress`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
    token: string,
  ) {
    try {
      const res = await this.api.patch(`/quiz/questions/${id}`, params, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteQuestion(id: string, token: string) {
    try {
      await this.api.delete(`/quiz/questions/${id}`, {
        headers: this.auth(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getTags(token: string) {
    try {
      const res = await this.api.get('/quiz/tags', {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async createTag(name: string, token: string) {
    try {
      const res = await this.api.post(
        '/quiz/tags',
        { name },
        { headers: this.auth(token) },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteTag(id: number, token: string) {
    try {
      await this.api.delete(`/quiz/tags/${id}`, {
        headers: this.auth(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async checkBankHash(hash: string, token: string) {
    try {
      const res = await this.api.get(`/quiz/banks/check-hash/${hash}`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getDerivedBanks(bankId: string, token: string) {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/derived-banks`, {
        headers: this.auth(token),
      });
      return res.data.data ?? [];
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getBankRoadmaps(
    bankId: string,
    token: string,
  ): Promise<BankRoadmapItem[]> {
    try {
      const res = await this.api.get(`/quiz/banks/${bankId}/roadmaps`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }
}
