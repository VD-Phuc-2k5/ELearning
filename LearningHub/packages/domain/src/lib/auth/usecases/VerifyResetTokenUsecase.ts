import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class VerifyResetTokenUsecase
  implements Usecase<void, { token: string }>
{
  constructor(private repository: IAuthRepository) {}
  async execute(params: { token: string }): Promise<Either<Failure, void>> {
    return this.repository.verifyResetToken(params.token);
  }
}
