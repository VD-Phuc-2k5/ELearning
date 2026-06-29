import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_DRAFT_REPOSITORY,
  IForumDraftRepository,
} from '../../domain/repositories/forum-draft.repository.interface';
import type { ForumDraftDomain } from '../../domain/entities/forum-draft.domain';

@Injectable()
export class ListMyDraftsUseCase {
  constructor(
    @Inject(FORUM_DRAFT_REPOSITORY)
    private readonly draftRepo: IForumDraftRepository,
  ) {}

  execute(
    authorId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumDraftDomain[]; total: number }> {
    return this.draftRepo.findByAuthor(authorId, page, limit);
  }
}
