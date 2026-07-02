import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class ForgotPasswordUsecase implements Usecase<void, { email: string }> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: { email: string }): Promise<Either<Failure, void>> {
    return this.repository.forgotPassword(params.email);
  }
}
