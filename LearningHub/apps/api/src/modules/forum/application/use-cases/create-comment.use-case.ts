import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_COMMENT_REPOSITORY,
  IForumCommentRepository,
} from '../../domain/repositories/forum-comment.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import { ForumCommentDomain } from '../../domain/entities/forum-comment.domain';

const MAX_COMMENT_DEPTH = 2;

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    content: string,
    parentId: string | undefined,
    authorId: string,
  ): Promise<ForumCommentDomain> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.isLocked) throw new BadRequestException('Post is locked');

    const member = await this.memberRepo.findByForumAndUser(forumId, authorId);
    if (!member)
      throw new BadRequestException('Only forum members can comment');

    let depth = 0;
    if (parentId) {
      const parent = await this.commentRepo.findByIdAndPost(parentId, postId);
      if (!parent) throw new NotFoundException('Parent comment not found');
      if (parent.depth >= MAX_COMMENT_DEPTH) {
        throw new BadRequestException('Maximum comment depth reached');
      }
      depth = parent.depth + 1;
      await this.commentRepo.incrementReplyCount(parentId, 1);
    }

    const comment = await this.commentRepo.create({
      postId,
      authorId,
      parentId,
      depth,
      content,
    });
    await this.postRepo.incrementCommentCount(postId, 1);
    return comment;
  }
}
