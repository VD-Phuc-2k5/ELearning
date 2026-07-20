import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { Role } from '../../domain/entities/role.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { UpdateRoleDto } from '../dto/update-role.dto';

export interface UpdateRoleParams extends UpdateRoleDto {
  id: number;
}

export interface UpdateRoleResult {
  role: Role;
}

@Injectable()
export class UpdateRoleUseCase
  implements Usecase<UpdateRoleResult, UpdateRoleParams>
{
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(
    params: UpdateRoleParams,
  ): Promise<Either<Failure, UpdateRoleResult>> {
    const role = await this.roleRepo.findById(params.id);
    if (!role) return left(AuthFailures.roleNotFound());
    if (params.name !== undefined) role.name = params.name;
    if (params.description !== undefined) role.description = params.description;
    const updated = await this.roleRepo.update(role);
    return right({ role: updated });
  }
}
