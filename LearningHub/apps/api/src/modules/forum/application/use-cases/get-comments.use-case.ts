import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_COMMENT_REPOSITORY,
  IForumCommentRepository,
  type CommentListPage,
  type GetCommentsInput,
} from '../../domain/repositories/forum-comment.repository.interface';

@Injectable()
export class GetCommentsUseCase {
  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
  ) {}

  execute(input: GetCommentsInput): Promise<CommentListPage> {
    return this.commentRepo.findAll(input);
  }
}
