import { Either, Failure, Usecase } from '@learning-hub/core';
import { User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class AdminRegisterUsecase implements Usecase<User, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, User>> {
    return this.repository.registerAdmin(params);
  }
}
