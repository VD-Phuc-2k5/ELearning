import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (
      (ctx.getType() === 'http' &&
        ctx.switchToHttp().getRequest().path === '/metrics') ||
      ctx.switchToHttp().getRequest().path === '/health'
    ) {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      try {
        await super.canActivate(ctx);
      } catch {
        // Optional auth: silently ignore missing/invalid token
      }
      return true;
    }
    return super.canActivate(ctx) as Promise<boolean>;
  }
}
