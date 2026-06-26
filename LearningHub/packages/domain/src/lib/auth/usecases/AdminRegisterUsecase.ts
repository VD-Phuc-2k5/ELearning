import { Either, Failure, Usecase } from '@learning-hub/core';
import { RegisterParams, User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class AdminRegisterUsecase implements Usecase<User, RegisterParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: RegisterParams): Promise<Either<Failure, User>> {
    return this.repository.registerAdmin(params);
  }
}
