import { Either, Failure, Usecase } from '@learning-hub/core';
import { Role } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface GetUserRolesParams {
  userId: string;
}

export class GetUserRolesUsecase implements Usecase<Role[], GetUserRolesParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: GetUserRolesParams): Promise<Either<Failure, Role[]>> {
    return this.repository.getUserRoles(params.userId)
  }
}
