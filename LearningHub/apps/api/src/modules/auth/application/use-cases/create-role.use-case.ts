import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { Role } from '../../domain/entities/role.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { CreateRoleDto } from '../dto/create-role.dto';

export type CreateRoleParams = CreateRoleDto;
export interface CreateRoleResult {
  role: Role;
}

@Injectable()
export class CreateRoleUseCase
  implements Usecase<CreateRoleResult, CreateRoleParams>
{
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(
    params: CreateRoleParams,
  ): Promise<Either<Failure, CreateRoleResult>> {
    const existing = await this.roleRepo.findByCode(params.code);
    if (existing) return left(AuthFailures.roleAlreadyExists());
    const role = await this.roleRepo.create({
      code: params.code,
      name: params.name,
      description: params.description ?? '',
    });
    return right({ role });
  }
}
