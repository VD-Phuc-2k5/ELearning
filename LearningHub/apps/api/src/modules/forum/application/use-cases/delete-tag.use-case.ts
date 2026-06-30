import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async execute(id: number): Promise<void> {
    const tag = await this.tagRepo.findById(id);
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepo.delete(id);
  }
}
