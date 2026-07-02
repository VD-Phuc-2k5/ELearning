import { Inject, Injectable } from '@nestjs/common';
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
  ) {}

  async execute(input: GetForumListInput): Promise<ForumListPage> {
    const isAdmin = input.userId
      ? (await this.userRoleRepo.findByUserId(input.userId)).some((r) =>
          ADMIN_ROLES.has(r.role.code),
        )
      : false;
    return this.forumRepo.findAll({ ...input, isAdmin });
  }
}
