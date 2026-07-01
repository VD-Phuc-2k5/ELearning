import { Either, Failure, Usecase, NoParams } from '@learning-hub/core';
import { Role } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetRolesUsecase implements Usecase<Role[], NoParams> {
  constructor(private repository: IAuthRepository) {}

  async execute(_params: NoParams): Promise<Either<Failure, Role[]>> {
    return await this.repository.getRoles();
  }
}
