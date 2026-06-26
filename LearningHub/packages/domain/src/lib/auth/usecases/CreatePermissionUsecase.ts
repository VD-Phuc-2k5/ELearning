import { Either, Failure, Usecase } from '@learning-hub/core';
import { Permission } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class CreatePermissionUsecase implements Usecase<Permission, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, Permission>> {
    return this.repository.createPermission(params);
  }
}
