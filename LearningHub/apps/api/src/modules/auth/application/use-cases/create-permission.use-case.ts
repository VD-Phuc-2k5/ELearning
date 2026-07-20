import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IPermissionRepository } from '../../domain/repositories/i-permission.repository';
import { IResourceRegistryService } from '../interfaces/i-resource-registry.service';
import { Permission } from '../../domain/entities/permission.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { CreatePermissionDto } from '../dto/permission.dto';

export type CreatePermissionParams = CreatePermissionDto;
export interface CreatePermissionResult {
  permission: Permission;
}

@Injectable()
export class CreatePermissionUseCase
  implements Usecase<CreatePermissionResult, CreatePermissionParams>
{
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepo: IPermissionRepository,
    @Inject('IResourceRegistryService')
    private readonly resourceRegistry: IResourceRegistryService,
  ) {}

  async execute(
    params: CreatePermissionParams,
  ): Promise<Either<Failure, CreatePermissionResult>> {
    if (!this.resourceRegistry.hasResource(params.resource)) {
      return left(AuthFailures.resourceNotFound());
    }
    const code = `${params.resource}:${params.action}`;
    const existing = await this.permissionRepo.findByCode(code);
    if (existing) return left(AuthFailures.permissionAlreadyExists());
    const permission = await this.permissionRepo.create({
      code,
      name: params.name,
      description: params.description ?? '',
      resource: params.resource,
      action: params.action,
    });
    return right({ permission });
  }
}
