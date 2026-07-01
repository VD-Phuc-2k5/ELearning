import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import type {
  ForumDomain,
  ForumVisibility,
} from '../../domain/entities/forum.domain';

export interface CreateForumParams {
  name: string;
  description?: string;
  visibility?: ForumVisibility;
  bannerUrl?: string;
  iconUrl?: string;
}

@Injectable()
export class CreateForumUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    params: CreateForumParams,
    ownerId: string,
  ): Promise<ForumDomain> {
    const forum = await this.forumRepo.create({
      name: params.name,
      description: params.description,
      visibility: params.visibility,
      bannerUrl: params.bannerUrl,
      iconUrl: params.iconUrl,
      ownerId,
    });
    await this.memberRepo.create({
      forumId: forum.id,
      userId: ownerId,
      role: 'owner',
    });
    await this.forumRepo.incrementMemberCount(forum.id, 1);
    return forum;
  }
}
