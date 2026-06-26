import { Either, Failure, Usecase } from '@learning-hub/core';
import { AuthTokens, LoginParams } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class AdminLoginUsecase implements Usecase<AuthTokens, LoginParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: LoginParams): Promise<Either<Failure, AuthTokens>> {
    return this.repository.adminLogin(params);
  }
}
