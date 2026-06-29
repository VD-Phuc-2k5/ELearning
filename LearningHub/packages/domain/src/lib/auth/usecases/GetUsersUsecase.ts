import { Either, Failure, Usecase, NoParams } from '@learning-hub/core';
import { User } from '../entities/entities';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetUsersUsecase implements Usecase<User[], NoParams> {
    constructor(private repository: IAuthRepository) { }

    async execute(params: NoParams): Promise<Either<Failure, User[]>> {
        return await this.repository.getUsers();
    }
}
