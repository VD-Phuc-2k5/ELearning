import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_DRAFT_REPOSITORY,
  IForumDraftRepository,
  type UpsertDraftInput,
} from '../../domain/repositories/forum-draft.repository.interface';
import type { ForumDraftDomain } from '../../domain/entities/forum-draft.domain';

@Injectable()
export class SaveDraftUseCase {
  constructor(
    @Inject(FORUM_DRAFT_REPOSITORY)
    private readonly draftRepo: IForumDraftRepository,
  ) {}

  execute(
    input: UpsertDraftInput,
    existingId?: string,
  ): Promise<ForumDraftDomain> {
    return this.draftRepo.upsert(input, existingId);
  }
}
