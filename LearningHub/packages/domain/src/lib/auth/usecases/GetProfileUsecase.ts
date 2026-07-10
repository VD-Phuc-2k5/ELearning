import { Either, Failure, Usecase, NoParams } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';
import { User } from '../entities/entities';

export class GetProfileUsecase implements Usecase<User, NoParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(_params: NoParams): Promise<Either<Failure, User>> {
    return this.repository.getProfile();
  }
}
