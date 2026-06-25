import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { Role } from '../../domain/entities/role.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { CreateRoleDto } from '../dto/role.dto';

export interface CreateRoleParams extends CreateRoleDto {}
export interface CreateRoleResult { role: Role; }

@Injectable()
export class CreateRoleUseCase implements Usecase<CreateRoleResult, CreateRoleParams> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(params: CreateRoleParams): Promise<Either<Failure, CreateRoleResult>> {
    const existing = await this.roleRepo.findByCode(params.code);
    if (existing) return left(AuthFailures.roleAlreadyExists());
    const role = await this.roleRepo.create(
      new Role(
        undefined as any,
        params.code,
        params.name,
        params.description ?? '',
        new Date(),
        new Date(),
      ),
    );
    return right({ role });
  }
}
