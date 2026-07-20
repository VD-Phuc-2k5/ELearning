import axios from 'axios';
import FormData from 'form-data';
import { handleAxiosError } from '@learning-hub/core';
import { getServerCookies } from '../../serverCookies';
import {
  Problem,
  TestCase,
  Submission,
  CreateProblemParams,
  UpdateProblemParams,
  CreateTestCaseParams,
  UpdateTestCaseParams,
  SubmitCodeParams,
  ProblemList,
  SampleTestCase,
} from '@learning-hub/domain';
import {
  IProblemRemoteDataSource,
  GetProblemsDataSourceParams,
} from './IProblemRemoteDataSource';

const NEST_API = `${process.env.NEST_API_URL || 'http://localhost:8080'}/api`;

export class ProblemRemoteDataSourceImpl implements IProblemRemoteDataSource {
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

  async getProblems(
    params?: GetProblemsDataSourceParams,
  ): Promise<ProblemList> {
    try {
      const res = await this.api.get('/problems', { params });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getProblemDetail(id: string): Promise<Problem> {
    try {
      const res = await this.api.get(`/problems/${id}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createProblem(params: CreateProblemParams): Promise<Problem> {
    try {
      const res = await this.api.post('/problems', params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateProblem(
    id: string,
    params: UpdateProblemParams,
  ): Promise<Problem> {
    try {
      const res = await this.api.patch(`/problems/${id}`, params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteProblem(id: string): Promise<void> {
    try {
      await this.api.delete(`/problems/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getTestCases(problemId: string): Promise<TestCase[]> {
    try {
      const res = await this.api.get(`/problems/${problemId}/test-cases`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getSampleTestCases(problemId: string): Promise<SampleTestCase[]> {
    try {
      const res = await this.api.get(
        `/problems/${problemId}/test-cases/samples`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createTestCase(
    problemId: string,
    params: CreateTestCaseParams,
  ): Promise<TestCase> {
    try {
      const res = await this.api.post(
        `/problems/${problemId}/test-cases`,
        params,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateTestCase(
    problemId: string,
    id: string,
    params: UpdateTestCaseParams,
  ): Promise<TestCase> {
    try {
      const res = await this.api.patch(
        `/problems/${problemId}/test-cases/${id}`,
        params,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteTestCase(problemId: string, id: string): Promise<void> {
    try {
      await this.api.delete(`/problems/${problemId}/test-cases/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async importTestCases(
    problemId: string,
    file: Buffer,
    fileName: string,
  ): Promise<unknown> {
    try {
      const form = new FormData();
      form.append('file', file, { filename: fileName });
      const res = await this.api.post(
        `/problems/${problemId}/test-cases/import-excel`,
        form,
        { headers: form.getHeaders() },
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getTestCasesTemplate(): Promise<{ data: string; contentType: string }> {
    try {
      const res = await this.api.get('/problems/test-cases/excel-template', {
        responseType: 'arraybuffer',
      });
      return {
        data: Buffer.from(res.data).toString('base64'),
        contentType: String(
          res.headers['content-type'] ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ),
      };
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async submitCode(
    problemId: string,
    params: SubmitCodeParams,
  ): Promise<Submission> {
    try {
      const res = await this.api.post(`/problems/${problemId}/submit`, params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getSubmissionStatus(submissionId: string): Promise<Submission> {
    try {
      const res = await this.api.get(`/submissions/${submissionId}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
