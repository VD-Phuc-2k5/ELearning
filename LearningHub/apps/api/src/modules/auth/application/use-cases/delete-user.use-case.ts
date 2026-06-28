import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface DeleteUserParams {
  id: string;
  actorId: string;
}

export interface DeleteUserResult {
  success: true;
}

@Injectable()
export class DeleteUserUseCase
  implements Usecase<DeleteUserResult, DeleteUserParams>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    params: DeleteUserParams,
  ): Promise<Either<Failure, DeleteUserResult>> {
    if (params.id === params.actorId)
      return left(AuthFailures.cannotDeleteSelf());
    const user = await this.userRepository.findById(params.id);
    if (!user) return left(AuthFailures.userNotFound());
    await this.userRepository.delete(params.id);
    return right({ success: true as const });
  }
}
