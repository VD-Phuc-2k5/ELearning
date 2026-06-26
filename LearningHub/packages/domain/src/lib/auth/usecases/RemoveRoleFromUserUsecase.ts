import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class RemoveRoleFromUserUsecase implements Usecase<void, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, void>> {
    return this.repository.removeRoleFromUser(params.userId, params.roleId)
  }
}
