import { Either, Failure, Usecase } from '@learning-hub/core';
import { UpdateAdminParams, User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface UpdateAdminUsecaseParams extends UpdateAdminParams {
  id: string;
}

export class UpdateAdminUsecase
  implements Usecase<User, UpdateAdminUsecaseParams>
{
  constructor(private repository: IAuthRepository) {}
  async execute(
    params: UpdateAdminUsecaseParams,
  ): Promise<Either<Failure, User>> {
    const { id, ...rest } = params;
    return this.repository.updateUser(id, rest);
  }
}
