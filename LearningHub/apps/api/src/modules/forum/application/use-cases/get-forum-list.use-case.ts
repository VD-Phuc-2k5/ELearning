import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  FORUM_REPOSITORY,
  IForumRepository,
  type GetForumListInput,
  type ForumListPage,
} from '../../domain/repositories/forum.repository.interface';
import type { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

const ADMIN_ROLES = new Set(['ADMIN', 'OWNER']);

@Injectable()
export class GetForumListUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserIdFromHeader(authHeader?: string): string | undefined {
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    try {
      const token = authHeader.slice(7);
      const payload = this.jwtService.decode(token) as {
        sub?: string;
      } | null;
      return payload?.sub;
    } catch {
      return undefined;
    }
  }

  async execute(
    input: GetForumListInput,
    authHeader?: string,
  ): Promise<ForumListPage> {
    const effectiveUserId =
      input.userId ?? this.extractUserIdFromHeader(authHeader);
    const isAdmin = effectiveUserId
      ? (await this.userRoleRepo.findByUserId(effectiveUserId)).some((r) =>
          ADMIN_ROLES.has(r.role.code),
        )
      : false;
    return this.forumRepo.findAll({
      ...input,
      userId: effectiveUserId,
      isAdmin,
    });
  }
}
