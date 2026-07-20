import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  FORUM_COMMENT_REPOSITORY,
  IForumCommentRepository,
} from '../../domain/repositories/forum-comment.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';

@Injectable()
export class DeleteCommentUseCase {
  private readonly logger = new Logger(DeleteCommentUseCase.name);

  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.commentRepo.findByIdAndPost(commentId, postId);
    if (!comment) throw new NotFoundException('Comment not found');

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    const isAuthor = comment.authorId === userId;
    const isModerator =
      member?.role === 'moderator' || member?.role === 'owner';
    if (!isAuthor && !isModerator) {
      throw new ForbiddenException(
        'Only the author or moderators can delete this comment',
      );
    }
    if (comment.parentId) {
      await this.commentRepo
        .incrementReplyCount(comment.parentId, -1)
        .catch((err) => {
          this.logger.error(
            'Failed to decrement reply count',
            (err as Error).stack,
          );
        });
    }
    await this.commentRepo.softDelete(commentId);
    await this.postRepo.incrementCommentCount(postId, -1);
    this.gateway.emitCommentDeleted(forumId, postId, { commentId });
  }
}
