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
import { CreatePostUseCase } from './create-post.use-case';
import type { PostType } from '../../domain/entities/forum-post.domain';
import { validateTiptapDoc } from '../helpers/extract-mentions';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PublishDraftUseCase {
  constructor(
    @Inject(FORUM_DRAFT_REPOSITORY)
    private readonly draftRepo: IForumDraftRepository,
    private readonly createPostUseCase: CreatePostUseCase,
  ) {}

  async execute(
    draftId: string,
    userId: string,
    forumId?: string,
  ): Promise<void> {
    const draft = await this.draftRepo.findById(draftId);
    if (!draft) throw new NotFoundException('Draft not found');
    if (draft.authorId !== userId) {
      throw new ForbiddenException("Cannot publish another user's draft");
    }
    const targetForumId = forumId ?? draft.forumId;
    if (!targetForumId) {
      throw new BadRequestException('Draft is not associated with a forum');
    }
    if (draft.content) {
      const validation = validateTiptapDoc(draft.content);
      if (!validation.ok) {
        throw new BadRequestException(
          `Invalid draft content: ${validation.reason}`,
        );
      }
    }
    await this.createPostUseCase.execute(
      targetForumId,
      {
        title: draft.title ?? 'Untitled',
        content: draft.content ?? undefined,
        postType: draft.postType as PostType,
      },
      userId,
    );
    await this.draftRepo.delete(draftId);
  }
}
