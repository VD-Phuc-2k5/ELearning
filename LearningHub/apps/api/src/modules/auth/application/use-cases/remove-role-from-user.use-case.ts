import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, right } from '@learning-hub/core';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';

export interface RemoveRoleFromUserParams {
  userId: string;
  roleId: number;
}

export interface RemoveRoleFromUserResult { success: true; }

@Injectable()
export class RemoveRoleFromUserUseCase implements Usecase<RemoveRoleFromUserResult, RemoveRoleFromUserParams> {
  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(
    params: RemoveRoleFromUserParams,
  ): Promise<Either<Failure, RemoveRoleFromUserResult>> {
    await this.userRoleRepo.remove(params.userId, params.roleId);
    return right({ success: true as const });
  }
}
