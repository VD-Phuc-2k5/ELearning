import { Either, Failure, Usecase } from '@learning-hub/core';
import { Role } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class CreateRoleUsecase implements Usecase<Role, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, Role>> {
    return this.repository.createRole(params);
  }
}
