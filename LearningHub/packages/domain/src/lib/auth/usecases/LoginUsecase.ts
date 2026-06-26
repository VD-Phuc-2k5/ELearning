import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';
import { AuthTokens, LoginParams } from '../entities/entities';

export class LoginUsecase implements Usecase<AuthTokens, LoginParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: LoginParams): Promise<Either<Failure, AuthTokens>> {
    return this.repository.login(params);
  }
}
