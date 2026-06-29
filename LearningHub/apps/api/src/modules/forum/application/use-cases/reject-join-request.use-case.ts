import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_JOIN_REQUEST_REPOSITORY,
  IForumJoinRequestRepository,
} from '../../domain/repositories/forum-join-request.repository.interface';
import { ForumJoinRequestDomain } from '../../domain/entities/forum-join-request.domain';

@Injectable()
export class RejectJoinRequestUseCase {
  constructor(
    @Inject(FORUM_JOIN_REQUEST_REPOSITORY)
    private readonly joinRequestRepo: IForumJoinRequestRepository,
  ) {}

  async execute(
    forumId: string,
    requestId: string,
    reviewerId: string,
  ): Promise<ForumJoinRequestDomain> {
    const req = await this.joinRequestRepo.findById(requestId);
    if (!req || req.forumId !== forumId) {
      throw new NotFoundException('Join request not found');
    }
    if (req.status !== 'pending') {
      throw new NotFoundException('Join request already processed');
    }
    return this.joinRequestRepo.updateStatus(requestId, 'rejected', reviewerId);
  }
}
