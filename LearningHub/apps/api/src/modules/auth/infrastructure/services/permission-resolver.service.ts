import { Injectable, Inject } from '@nestjs/common';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { IRolePermissionRepository } from '../../domain/repositories/i-role-permission.repository';
import { IUserPermissionRepository } from '../../domain/repositories/i-user-permission.repository';
import { IPermissionResolverService } from '../../application/interfaces/i-permission-resolver.service';

const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class PermissionResolverService implements IPermissionResolverService {
  private readonly cache = new Map<
    string,
    { data: Set<string>; expiresAt: number }
  >();

  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
    @Inject('IUserPermissionRepository')
    private readonly userPermissionRepository: IUserPermissionRepository,
  ) {}

  async getEffectivePermissions(userId: string): Promise<Set<string>> {
    const cached = this.cache.get(userId);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const userRoles = await this.userRoleRepository.findByUserId(userId);

    if (userRoles.some((ur) => ur.role.code === 'OWNER')) {
      const ownerSet = new Set(['*']);
      this.cache.set(userId, {
        data: ownerSet,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return ownerSet;
    }

    const roleIds = userRoles.map((ur) => ur.role.id);

    const roleCodes =
      await this.rolePermissionRepository.findPermissionCodesByRoleIds(roleIds);
    const effective = new Set<string>(roleCodes);

    const directPerms =
      await this.userPermissionRepository.findByUserId(userId);
    for (const dp of directPerms) {
      if (dp.isGranted) effective.add(dp.permission.code);
      else effective.delete(dp.permission.code);
    }

    this.cache.set(userId, {
      data: effective,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return effective;
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }
}
