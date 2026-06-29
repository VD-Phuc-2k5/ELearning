import { Either, Failure, Usecase } from '@learning-hub/core';
import { RegisterParams, User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class RegisterUsecase implements Usecase<User, RegisterParams> {
    constructor(private repository: IAuthRepository) { }
    async execute(params: RegisterParams): Promise<Either<Failure, User>> {
        return this.repository.register(params);
    }
}
