import { Either, Failure, Usecase, NoParams } from '@learning-hub/core';
import { Permission } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetPermissionsUsecase implements Usecase<Permission[], NoParams> {
  constructor(private repository: IAuthRepository) {}

  async execute(_params: NoParams): Promise<Either<Failure, Permission[]>> {
    return await this.repository.getPermissions();
  }
}
