import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { IPermissionResolverService } from '../../application/interfaces/i-permission-resolver.service';
import { User } from '../../domain/entities/user.entity';

const METHOD_ACTION: Record<string, string> = {
  GET: 'get',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

@Injectable()
export class ResourceActionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const bypassPaths = [
      '/api/sandbox',
      '/sandbox',
      '/api/problems',
      '/problems',
      '/api/submissions',
      '/submissions',
    ];
    if (bypassPaths.some((p) => request.path.startsWith(p))) {
      return true;
    }

    // Routes using @RequirePermissions are handled by PermissionGuard
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (requiredPerms?.length) return true;

    const user: User | undefined = request.user;
    if (!user) throw new UnauthorizedException();

    const method: string = request.method;
    const action = METHOD_ACTION[method];
    if (!action) return true;

    const resource = this.extractResource(request.path as string);
    if (!resource) return true;

    const permissions = await this.permissionResolver.getEffectivePermissions(
      user.id,
    );
    return permissions.has('*') || permissions.has(`${resource}:${action}`);
  }

  private extractResource(path: string): string | null {
    const SKIP = new Set(['api', 'admin']);
    const segments = path.split('/').filter(Boolean);
    return segments.find((s) => !SKIP.has(s)) ?? null;
  }
}
