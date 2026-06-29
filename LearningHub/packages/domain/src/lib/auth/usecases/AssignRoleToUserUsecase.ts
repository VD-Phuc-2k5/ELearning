import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface AssignRoleToUserParams {
  userId: string;
  roleId: number;
}

export class AssignRoleToUserUsecase implements Usecase<void, AssignRoleToUserParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: AssignRoleToUserParams): Promise<Either<Failure, void>> {
    return this.repository.assignRoleToUser(params.userId, params.roleId)
  }
}
