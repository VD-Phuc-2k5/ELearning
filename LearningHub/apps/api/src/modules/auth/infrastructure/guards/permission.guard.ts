import {
  CanActivate,
  Injectable,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { User } from '../../domain/entities/user.entity';
import { IPermissionResolverService } from '../../application/interfaces/i-permission-resolver.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required?.length) return true;

    const user: User = ctx.switchToHttp().getRequest().user;
    const effective = await this.permissionResolver.getEffectivePermissions(
      user.id,
    );
    return effective.has('*') || required.every((p) => effective.has(p));
  }
}
