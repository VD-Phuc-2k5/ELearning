import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
  MemberSearchResult,
} from '../../domain/repositories/forum-member.repository.interface';

@Injectable()
export class SearchMembersUseCase {
  constructor(
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  execute(
    forumId: string,
    keyword: string,
    limit?: number,
  ): Promise<MemberSearchResult[]> {
    return this.memberRepo.searchByName(forumId, keyword, limit);
  }
}
