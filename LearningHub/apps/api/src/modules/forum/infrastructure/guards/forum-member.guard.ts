import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import type { ForumMemberRole } from '../../domain/entities/forum.domain';

const ROLE_RANK: Record<ForumMemberRole, number> = {
  member: 0,
  moderator: 1,
  owner: 2,
};

interface ForumRequest {
  user?: { id: string };
  params?: Record<string, string>;
  forumMember?: { role: ForumMemberRole; userId: string; forumId: string };
}

export interface ForumMemberRequest extends ForumRequest {}

/**
 * Guard that verifies the authenticated user is a member of the forum
 * referenced by the route, with at least the minimum role.
 *
 * Hidden forums return 404 to non-members so the URL does not leak existence.
 */
@Injectable()
export class ForumMemberGuard implements CanActivate {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<ForumRequest>();
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const forumId = extractForumId(req);
    if (!forumId) throw new NotFoundException('Forum not found');

    const forum = await this.forumRepo.findById(forumId);
    if (!forum) throw new NotFoundException('Forum not found');

    if (forum.visibility === 'hidden') {
      const member = await this.memberRepo.findByForumAndUser(forumId, userId);
      if (!member) throw new NotFoundException('Forum not found');
      req.forumMember = {
        role: member.role,
        userId: member.userId,
        forumId: member.forumId,
      };
      return this.checkMinimumRole(req, ctx);
    }

    if (forum.visibility === 'private') {
      const member = await this.memberRepo.findByForumAndUser(forumId, userId);
      if (!member) throw new ForbiddenException('Not a member of this forum');
      req.forumMember = {
        role: member.role,
        userId: member.userId,
        forumId: member.forumId,
      };
      return this.checkMinimumRole(req, ctx);
    }

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    req.forumMember = member
      ? { role: member.role, userId: member.userId, forumId: member.forumId }
      : { role: 'member' as ForumMemberRole, userId, forumId };
    return this.checkMinimumRole(req, ctx);
  }

  private checkMinimumRole(req: ForumRequest, ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const requiredRole = Reflect.getMetadata('forumMinimumRole', handler) as
      | ForumMemberRole
      | undefined;
    if (!requiredRole) return true;

    const memberRole = req.forumMember?.role ?? 'member';
    if (ROLE_RANK[memberRole] < ROLE_RANK[requiredRole]) {
      throw new ForbiddenException(
        `Requires at least ${requiredRole} role in this forum`,
      );
    }
    return true;
  }
}

function extractForumId(req: ForumRequest): string | undefined {
  const params = req.params ?? {};
  return params.forumId ?? params.id;
}
