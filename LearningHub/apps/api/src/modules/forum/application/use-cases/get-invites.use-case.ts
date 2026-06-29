import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_INVITE_REPOSITORY,
  IForumInviteRepository,
} from '../../domain/repositories/forum-invite.repository.interface';
import { ForumInviteDomain } from '../../domain/entities/forum-invite.domain';

@Injectable()
export class GetInvitesUseCase {
  constructor(
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
  ) {}

  execute(
    forumId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumInviteDomain[]; total: number }> {
    return this.inviteRepo.findByForum(forumId, page, limit);
  }
}
