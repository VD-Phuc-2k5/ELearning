import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_INVITE_REPOSITORY,
  IForumInviteRepository,
} from '../../domain/repositories/forum-invite.repository.interface';

@Injectable()
export class RevokeInviteUseCase {
  constructor(
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
  ) {}

  async execute(forumId: string, inviteId: string): Promise<void> {
    const invite = await this.inviteRepo.findByForum(forumId, 1, 1000);
    const found = invite.data.find((i) => i.id === inviteId);
    if (!found) throw new NotFoundException('Invite not found');
    await this.inviteRepo.delete(inviteId);
  }
}
