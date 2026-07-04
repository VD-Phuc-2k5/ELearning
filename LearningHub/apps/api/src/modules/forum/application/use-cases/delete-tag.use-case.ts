import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_TAG_REPOSITORY,
  IForumTagRepository,
} from '../../domain/repositories/forum-tag.repository.interface';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(FORUM_TAG_REPOSITORY)
    private readonly tagRepo: IForumTagRepository,
  ) {}

  async execute(id: number, userId: string): Promise<void> {
    const tag = await this.tagRepo.findById(id);
    if (!tag) throw new NotFoundException('Tag not found');
    if (tag.createdBy !== null && tag.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can delete this tag');
    }
    await this.tagRepo.delete(id);
  }
}
