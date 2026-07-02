import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

export class ResetPasswordUsecase
  implements Usecase<void, ResetPasswordParams>
{
  constructor(private repository: IAuthRepository) {}
  async execute(params: ResetPasswordParams): Promise<Either<Failure, void>> {
    return this.repository.resetPassword(params.token, params.newPassword);
  }
}
