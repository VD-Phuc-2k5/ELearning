import { Either, Failure, Usecase } from '@learning-hub/core';
import { User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface GetUsersParams {
  role?: string;
}

export class GetUsersUsecase implements Usecase<User[], GetUsersParams> {
  constructor(private repository: IAuthRepository) {}

  async execute(params: GetUsersParams): Promise<Either<Failure, User[]>> {
    return await this.repository.getUsers(params.role);
  }
}
