import {
  Either,
  Failure,
  right,
  left,
  UnknownFailure,
  AuthenticationFailure,
  PermissionFailure,
  NotFoundFailure,
  NetworkFailure,
  AuthenticationException,
  PermissionException,
  NotFoundException,
  NetworkException,
} from '@learning-hub/core';
import {
  CodeExecution,
  ExecuteCodeParams,
  ExecutionResult,
  ISandboxRepository,
} from '@learning-hub/domain';
import { ISandboxRemoteDataSource } from '../datasources/ISandboxRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure();
  if (e instanceof NotFoundException) return new NotFoundFailure();
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure();
}

export class SandboxRepositoryImpl implements ISandboxRepository {
  constructor(
    private dataSource: ISandboxRemoteDataSource,
    private token?: string,
  ) {}

  async executeCode(
    params: ExecuteCodeParams,
  ): Promise<Either<Failure, ExecutionResult>> {
    try {
      const res = await this.dataSource.executeCode(params, this.token);
      return right(res);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getHistory(limit?: number): Promise<Either<Failure, CodeExecution[]>> {
    try {
      const res = await this.dataSource.getHistory(limit, this.token);
      return right(res);
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
