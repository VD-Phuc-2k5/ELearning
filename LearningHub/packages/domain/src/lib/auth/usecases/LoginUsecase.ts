import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class LoginUsecase implements Usecase<{ accessToken: string; refreshToken: string }, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, { accessToken: string; refreshToken: string }>> {
    return this.repository.login(params);
  }
}
