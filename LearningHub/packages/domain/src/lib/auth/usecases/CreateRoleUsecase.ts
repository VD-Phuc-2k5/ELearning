import { Either, Failure, Usecase } from '@learning-hub/core';
import { CreateRoleParams, Role } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class CreateRoleUsecase implements Usecase<Role, CreateRoleParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: CreateRoleParams): Promise<Either<Failure, Role>> {
    return this.repository.createRole(params);
  }
}
