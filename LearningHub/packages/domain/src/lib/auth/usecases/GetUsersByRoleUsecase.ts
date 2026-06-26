import { Either, Failure, Usecase } from '@learning-hub/core';
import { User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface GetUsersByRoleParams {
  roleId: number;
}

export class GetUsersByRoleUsecase implements Usecase<User[], GetUsersByRoleParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: GetUsersByRoleParams): Promise<Either<Failure, User[]>> {
    return this.repository.getUsers();
  }
}
