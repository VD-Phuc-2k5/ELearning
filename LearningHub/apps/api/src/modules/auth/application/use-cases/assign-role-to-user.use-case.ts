import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { UserRole } from '../../domain/entities/user-role.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface AssignRoleToUserParams {
  userId: string;
  roleId: number;
  assignedBy: string;
}

export interface AssignRoleToUserResult { userRole: UserRole; }

@Injectable()
export class AssignRoleToUserUseCase implements Usecase<AssignRoleToUserResult, AssignRoleToUserParams> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(
    params: AssignRoleToUserParams,
  ): Promise<Either<Failure, AssignRoleToUserResult>> {
    const user = await this.userRepo.findById(params.userId);
    if (!user) return left(AuthFailures.userNotFound());
    if (!user.isActive) return left(AuthFailures.userInactive());
    const role = await this.roleRepo.findById(params.roleId);
    if (!role) return left(AuthFailures.roleNotFound());
    const exists = await this.userRoleRepo.exists(params.userId, params.roleId);
    if (exists) return left(AuthFailures.alreadyAssigned());
    const userRole = await this.userRoleRepo.assign(
      params.userId,
      params.roleId,
      params.assignedBy,
    );
    return right({ userRole });
  }
}
