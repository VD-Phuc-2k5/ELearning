import {
  Inject,
  Injectable,
  ForbiddenException,
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
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';

@Injectable()
export class HidePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    moderatorId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<void> {
    void reasonCode;
    void reasonText;
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can hide posts');
    }
    await this.postRepo.updateStatus(postId, 'hidden');
    if (post.status === 'published') {
      await this.forumRepo.incrementPostCount(forumId, -1);
    }
  }
}

@Injectable()
export class RestorePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    moderatorId: string,
  ): Promise<void> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can restore posts');
    }
    await this.postRepo.updateStatus(postId, 'published');
    if (post.status === 'hidden') {
      await this.forumRepo.incrementPostCount(forumId, 1);
    }
  }
}

@Injectable()
export class HideCommentUseCase {
  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    commentId: string,
    moderatorId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<void> {
    void reasonCode;
    void reasonText;
    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can hide comments');
    }
    await this.commentRepo.updateStatus(commentId, 'hidden');
  }
}

@Injectable()
export class RestoreCommentUseCase {
  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    commentId: string,
    moderatorId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can restore comments');
    }
    await this.commentRepo.updateStatus(commentId, 'published');
  }
}
