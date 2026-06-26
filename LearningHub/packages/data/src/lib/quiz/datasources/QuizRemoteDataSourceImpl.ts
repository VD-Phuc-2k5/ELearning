import axios from 'axios';
import {
  GetBanksQuizParams,
  CreateBankQuizParams,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
} from '@learning-hub/domain';

const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';

export class QuizRemoteDataSourceImpl {
  private api = axios.create({ baseURL: NEST_API });

  private auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async getBanks(params: GetBanksQuizParams, token: string) {
    const res = await this.api.get('/api/quiz/banks', {
      params,
      headers: this.auth(token),
    });
    return res.data;
  }

  async getBankDetail(id: string, token: string) {
    const res = await this.api.get(`/api/quiz/banks/${id}`, {
      headers: this.auth(token),
    });
    return res.data;
  }

  async createBank(params: CreateBankQuizParams, token: string) {
    const res = await this.api.post('/api/quiz/banks', params, {
      headers: this.auth(token),
    });
    return res.data;
  }

  async updateBank(id: string, params: UpdateBankQuizParams, token: string) {
    const res = await this.api.patch(`/api/quiz/banks/${id}`, params, {
      headers: this.auth(token),
    });
    return res.data;
  }

  async deleteBank(id: string, token: string) {
    await this.api.delete(`/api/quiz/banks/${id}`, {
      headers: this.auth(token),
    });
  }

  async uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    token: string,
    fileHash?: string,
  ) {
    const form = new FormData();
    form.append('file', new Blob([file]), fileName);
    if (fileHash) form.append('fileHash', fileHash);
    const res = await this.api.post(
      `/api/quiz/banks/${bankId}/upload-excel`,
      form,
      {
        headers: { ...this.auth(token) },
      },
    );
    return res.data;
  }

  async parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    token: string,
  ) {
    const form = new FormData();
    form.append('file', new Blob([file]), fileName);
    const res = await this.api.post(
      `/api/quiz/banks/${bankId}/parse-excel`,
      form,
      {
        headers: { ...this.auth(token) },
      },
    );
    return res.data;
  }

  async getUploadHistory(bankId: string, token: string) {
    const res = await this.api.get(`/api/quiz/banks/${bankId}/upload-history`, {
      headers: this.auth(token),
    });
    return res.data;
  }

  async getQuestionsForQuiz(
    bankId: string,
    token: string,
    showAnswers = false,
  ) {
    const res = await this.api.get(`/api/quiz/banks/${bankId}/questions`, {
      headers: this.auth(token),
      params: showAnswers ? { showAnswers: 'true' } : undefined,
    });
    return res.data;
  }

  async verifyAnswer(
    questionId: string,
    selectedOptionId: string,
    token: string,
  ) {
    const res = await this.api.post(
      `/api/quiz/questions/${questionId}/verify`,
      { selectedOptionId },
      { headers: this.auth(token) },
    );
    return res.data;
  }

  async submitQuiz(
    bankId: string,
    answers: { questionId: string; selectedOptionId: string }[],
    token: string,
  ) {
    const res = await this.api.post(
      `/api/quiz/banks/${bankId}/submit`,
      { answers },
      { headers: this.auth(token) },
    );
    return res.data;
  }

  async updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
    token: string,
  ) {
    const res = await this.api.patch(`/api/quiz/questions/${id}`, params, {
      headers: this.auth(token),
    });
    return res.data;
  }

  async deleteQuestion(id: string, token: string) {
    await this.api.delete(`/api/quiz/questions/${id}`, {
      headers: this.auth(token),
    });
  }

  async getTags(token: string) {
    const res = await this.api.get('/api/quiz/tags', {
      headers: this.auth(token),
    });
    return res.data;
  }

  async createTag(name: string, token: string) {
    const res = await this.api.post(
      '/api/quiz/tags',
      { name },
      { headers: this.auth(token) },
    );
    return res.data;
  }

  async deleteTag(id: number, token: string) {
    await this.api.delete(`/api/quiz/tags/${id}`, {
      headers: this.auth(token),
    });
  }

  async checkBankHash(hash: string, token: string) {
    const res = await this.api.get(`/api/quiz/banks/check-hash/${hash}`, {
      headers: this.auth(token),
    });
    return res.data;
  }

  async getDerivedBanks(bankId: string, token: string) {
    const res = await this.api.get(`/api/quiz/banks/${bankId}/derived-banks`, {
      headers: this.auth(token),
    });
    return res.data;
  }
}
