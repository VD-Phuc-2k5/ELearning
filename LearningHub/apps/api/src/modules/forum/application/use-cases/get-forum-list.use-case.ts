import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_REPOSITORY,
  IForumRepository,
  type GetForumListInput,
  type ForumListPage,
} from '../../domain/repositories/forum.repository.interface';

@Injectable()
export class GetForumListUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
  ) {}

  execute(input: GetForumListInput): Promise<ForumListPage> {
    return this.forumRepo.findAll(input);
  }
}
