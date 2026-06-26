import { Either, Failure, Usecase } from '@learning-hub/core';
import { CreatePermissionParams, Permission } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class CreatePermissionUsecase implements Usecase<Permission, CreatePermissionParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: CreatePermissionParams): Promise<Either<Failure, Permission>> {
    return this.repository.createPermission(params);
  }
}
