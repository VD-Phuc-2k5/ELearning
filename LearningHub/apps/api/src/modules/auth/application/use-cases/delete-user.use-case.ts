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
    try {
      await this.userRepository.delete(params.id);
    } catch (error) {
      if ((error as { code?: string }).code === '23503') {
        return left(AuthFailures.userHasRelatedRecords());
      }
      throw error;
    }
    return right({ success: true as const });
  }
}
