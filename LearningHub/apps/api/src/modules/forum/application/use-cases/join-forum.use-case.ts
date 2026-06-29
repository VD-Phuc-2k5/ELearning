import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
import { ForumMemberDomain } from '../../domain/entities/forum-member.domain';
import { ForumJoinRequestDomain } from '../../domain/entities/forum-join-request.domain';

export interface JoinForumResult {
  joined: boolean;
  member?: ForumMemberDomain;
  joinRequest?: ForumJoinRequestDomain;
}

@Injectable()
export class JoinForumUseCase {
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
    userId: string,
    message?: string,
  ): Promise<JoinForumResult> {
    const forum = await this.forumRepo.findById(forumId);
    if (!forum) throw new NotFoundException('Forum not found');
    if (forum.isLocked) throw new BadRequestException('Forum is locked');

    const existing = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (existing) throw new ConflictException('Already a member');

    if (forum.visibility === 'public') {
      const member = await this.memberRepo.create({
        forumId,
        userId,
        role: 'member',
      });
      await this.forumRepo.incrementMemberCount(forumId, 1);
      return { joined: true, member };
    }

    const existingRequest = await this.joinRequestRepo.findByForumAndUser(
      forumId,
      userId,
    );
    if (existingRequest && existingRequest.status === 'pending') {
      throw new ConflictException('Join request already pending');
    }
    const joinRequest = await this.joinRequestRepo.create({
      forumId,
      userId,
      message,
    });
    return { joined: false, joinRequest };
  }
}
