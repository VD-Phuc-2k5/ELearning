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
    if (
      ctx.getType() === 'http' &&
      ctx.switchToHttp().getRequest().path === '/metrics'
    ) {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    // Routes using @RequirePermissions are handled by PermissionGuard
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (requiredPerms?.length) return true;

    const request = ctx.switchToHttp().getRequest();
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
    // ponytail: any authenticated user may manage these resources; JwtAuthGuard still enforces auth
    const OPEN_RESOURCES = new Set(['forum_tags']);
    const segments = path.split('/').filter(Boolean);
    const resource = segments.find((s) => !SKIP.has(s));
    if (!resource) return null;
    const normalized = resource.replace(/-/g, '_');
    return OPEN_RESOURCES.has(normalized) ? null : normalized;
  }
}
