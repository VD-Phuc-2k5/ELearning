import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_DRAFT_REPOSITORY,
  IForumDraftRepository,
} from '../../domain/repositories/forum-draft.repository.interface';

@Injectable()
export class DeleteDraftUseCase {
  constructor(
    @Inject(FORUM_DRAFT_REPOSITORY)
    private readonly draftRepo: IForumDraftRepository,
  ) {}

  async execute(draftId: string, userId: string): Promise<void> {
    const draft = await this.draftRepo.findById(draftId);
    if (!draft) throw new NotFoundException('Draft not found');
    if (draft.authorId !== userId) {
      throw new ForbiddenException("Cannot delete another user's draft");
    }
    await this.draftRepo.delete(draftId);
  }
}
