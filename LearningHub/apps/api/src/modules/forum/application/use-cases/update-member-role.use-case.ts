import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import { ForumMemberDomain } from '../../domain/entities/forum-member.domain';
import type { ForumMemberRole } from '../../domain/entities/forum.domain';

@Injectable()
export class UpdateMemberRoleUseCase {
  constructor(
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    targetUserId: string,
    role: ForumMemberRole,
    actorUserId: string,
  ): Promise<ForumMemberDomain> {
    const actor = await this.memberRepo.findByForumAndUser(
      forumId,
      actorUserId,
    );
    if (!actor || actor.role !== 'owner') {
      throw new ForbiddenException('Only the owner can change member roles');
    }
    const target = await this.memberRepo.findByForumAndUser(
      forumId,
      targetUserId,
    );
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'owner') {
      throw new BadRequestException('Cannot change the role of the owner');
    }
    if (role === 'owner') {
      throw new BadRequestException(
        'Use ownership transfer to assign owner role',
      );
    }
    return this.memberRepo.updateRole(target.id, role);
  }
}
