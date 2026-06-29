import { Either, Failure, Usecase } from '@learning-hub/core';
import { AuthTokens } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class RefreshTokenUsecase implements Usecase<AuthTokens, string> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: string): Promise<Either<Failure, AuthTokens>> {
    return this.repository.refreshToken(params);
  }
}
