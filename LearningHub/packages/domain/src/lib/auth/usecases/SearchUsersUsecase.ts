import { Either, Failure, Usecase } from '@learning-hub/core';
import { User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface SearchUsersUsecaseParams {
  email: string;
}

export class SearchUsersUsecase
  implements Usecase<User[], SearchUsersUsecaseParams>
{
  constructor(private repository: IAuthRepository) {}
  async execute(
    params: SearchUsersUsecaseParams,
  ): Promise<Either<Failure, User[]>> {
    return this.repository.searchUsersByEmail(params.email);
  }
}
