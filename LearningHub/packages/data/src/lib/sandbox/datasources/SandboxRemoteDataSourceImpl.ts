import axios from 'axios';
import {
  CodeExecution,
  ExecuteCodeParams,
  ExecutionResult,
} from '@learning-hub/domain';
import {
  AuthenticationException,
  NetworkException,
  NotFoundException,
  PermissionException,
  UnknownException,
} from '@learning-hub/core';
import { ISandboxRemoteDataSource } from './ISandboxRemoteDataSource';

const NEST_API = `${process.env.NEST_API_URL || 'http://localhost:8080'}/api`;

export class SandboxRemoteDataSourceImpl implements ISandboxRemoteDataSource {
  private api = axios.create({ baseURL: NEST_API });

  private auth(token?: string) {
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  async executeCode(
    params: ExecuteCodeParams,
    token?: string,
  ): Promise<ExecutionResult> {
    try {
      const res = await this.api.post('/sandbox/execute', params, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getHistory(limit?: number, token?: string): Promise<CodeExecution[]> {
    try {
      const res = await this.api.get('/sandbox/history', {
        params: limit ? { limit } : {},
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }
}
