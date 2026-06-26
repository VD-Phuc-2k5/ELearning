import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface RemoveRoleFromUserParams {
  userId: string;
  roleId: number;
}

export class RemoveRoleFromUserUsecase implements Usecase<void, RemoveRoleFromUserParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: RemoveRoleFromUserParams): Promise<Either<Failure, void>> {
    return this.repository.removeRoleFromUser(params.userId, params.roleId)
  }
}
