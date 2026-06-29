import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_JOIN_REQUEST_REPOSITORY,
  IForumJoinRequestRepository,
} from '../../domain/repositories/forum-join-request.repository.interface';
import { ForumJoinRequestDomain } from '../../domain/entities/forum-join-request.domain';

@Injectable()
export class GetJoinRequestsUseCase {
  constructor(
    @Inject(FORUM_JOIN_REQUEST_REPOSITORY)
    private readonly joinRequestRepo: IForumJoinRequestRepository,
  ) {}

  execute(
    forumId: string,
    status?: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumJoinRequestDomain[]; total: number }> {
    return this.joinRequestRepo.findByForum(forumId, status, page, limit);
  }
}
