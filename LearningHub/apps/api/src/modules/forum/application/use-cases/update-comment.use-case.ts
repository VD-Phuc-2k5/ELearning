import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_COMMENT_REPOSITORY,
  IForumCommentRepository,
} from '../../domain/repositories/forum-comment.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';
import { ForumCommentDomain } from '../../domain/entities/forum-comment.domain';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    commentId: string,
    content: string,
    userId: string,
  ): Promise<ForumCommentDomain> {
    const comment = await this.commentRepo.findByIdAndPost(commentId, postId);
    if (!comment) throw new NotFoundException('Comment not found');
    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    const isAuthor = comment.authorId === userId;
    const isModerator =
      member?.role === 'moderator' || member?.role === 'owner';
    if (!isAuthor && !isModerator) {
      throw new ForbiddenException(
        'Only the author or moderators can edit this comment',
      );
    }
    const updated = await this.commentRepo.update(commentId, content);
    this.gateway.emitCommentUpdated(forumId, postId, {
      commentId,
      content: updated.content,
    });
    return updated;
  }
}
