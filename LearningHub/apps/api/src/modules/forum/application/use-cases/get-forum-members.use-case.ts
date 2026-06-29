import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
  type MemberListPage,
} from '../../domain/repositories/forum-member.repository.interface';
import type { ForumMemberRole } from '../../domain/entities/forum.domain';

@Injectable()
export class GetForumMembersUseCase {
  constructor(
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  execute(
    forumId: string,
    page?: number,
    limit?: number,
    role?: ForumMemberRole,
  ): Promise<MemberListPage> {
    return this.memberRepo.findAll(forumId, page, limit, role);
  }
}
