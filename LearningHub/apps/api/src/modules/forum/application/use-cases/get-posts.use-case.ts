import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
  type GetPostsInput,
  type PostListPage,
} from '../../domain/repositories/forum-post.repository.interface';

@Injectable()
export class GetPostsUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
  ) {}

  execute(input: GetPostsInput, includeHidden = false): Promise<PostListPage> {
    return this.postRepo.findAll({ ...input, includeHidden });
  }
}
