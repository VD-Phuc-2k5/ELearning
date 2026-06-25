import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface DeleteRoleParams { id: number; }
export interface DeleteRoleResult { success: true; }

@Injectable()
export class DeleteRoleUseCase implements Usecase<DeleteRoleResult, DeleteRoleParams> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(params: DeleteRoleParams): Promise<Either<Failure, DeleteRoleResult>> {
    const role = await this.roleRepo.findById(params.id);
    if (!role) return left(AuthFailures.roleNotFound());
    await this.roleRepo.delete(params.id);
    return right({ success: true as const });
  }
}
