import { Either, Failure, Usecase } from '@learning-hub/core';
import { Role } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class UpdateRoleUsecase implements Usecase<Role, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, Role>> {
    return this.repository.updateRole(params.id, params.data)
  }
}
