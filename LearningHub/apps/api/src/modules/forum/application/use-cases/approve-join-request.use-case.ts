import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_JOIN_REQUEST_REPOSITORY,
  IForumJoinRequestRepository,
} from '../../domain/repositories/forum-join-request.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import { ForumJoinRequestDomain } from '../../domain/entities/forum-join-request.domain';

@Injectable()
export class ApproveJoinRequestUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
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
    const existing = await this.memberRepo.findByForumAndUser(
      forumId,
      req.userId,
    );
    if (existing) {
      await this.joinRequestRepo.updateStatus(
        requestId,
        'approved',
        reviewerId,
      );
      return req;
    }
    await this.memberRepo.create({
      forumId,
      userId: req.userId,
      role: 'member',
    });
    await this.forumRepo.incrementMemberCount(forumId, 1);
    return this.joinRequestRepo.updateStatus(requestId, 'approved', reviewerId);
  }
}
