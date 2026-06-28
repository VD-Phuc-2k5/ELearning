import { Either, Failure, Usecase } from '@learning-hub/core';
import { Role, UpdateRoleParams } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface UpdateRoleUsecaseParams {
  id: number;
  data: UpdateRoleParams;
}

export class UpdateRoleUsecase implements Usecase<Role, UpdateRoleUsecaseParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: UpdateRoleUsecaseParams): Promise<Either<Failure, Role>> {
    return this.repository.updateRole(params.id, params.data)
  }
}
