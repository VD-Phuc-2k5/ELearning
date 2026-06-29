import {
  Either,
  Failure,
  right,
  left,
  UnknownFailure,
  AuthenticationFailure,
  PermissionFailure,
  NotFoundFailure,
  NetworkFailure,
  AuthenticationException,
  PermissionException,
  NotFoundException,
  NetworkException,
} from '@learning-hub/core';
import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  ForumDetailResponse,
  ForumListItem,
  IForumRepository,
  JoinForumParams,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumsParams,
  PaginatedResponse,
  PostListItem,
  TogglePostBookmarkParams,
  TogglePostReactionParams,
} from '@learning-hub/domain';
import { IForumRemoteDataSource } from '../datasources/IForumRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure();
  if (e instanceof NotFoundException) return new NotFoundFailure();
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure();
}

export class ForumRepositoryImpl implements IForumRepository {
  constructor(
    private dataSource: IForumRemoteDataSource,
    token?: string,
  ) {
    if (token) this.dataSource.setToken(token);
  }

  async listForums(
    params: ListForumsParams,
  ): Promise<Either<Failure, PaginatedResponse<ForumListItem>>> {
    try {
      return right(await this.dataSource.listForums(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getForumDetail(
    slug: string,
  ): Promise<Either<Failure, ForumDetailResponse>> {
    try {
      return right(await this.dataSource.getForumDetail(slug));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createForum(
    data: CreateForumParams,
  ): Promise<Either<Failure, ForumListItem>> {
    try {
      return right(await this.dataSource.createForum(data));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async joinForum(params: JoinForumParams): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.joinForum(params.forumId, params.message);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async leaveForum(forumId: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.leaveForum(forumId);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async listForumPosts(
    params: ListForumPostsParams,
  ): Promise<Either<Failure, PaginatedResponse<PostListItem>>> {
    try {
      return right(await this.dataSource.listForumPosts(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createPost(
    data: CreatePostParams,
  ): Promise<Either<Failure, PostListItem>> {
    try {
      return right(await this.dataSource.createPost(data));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async listComments(
    params: ListCommentsParams,
  ): Promise<Either<Failure, PaginatedResponse<CommentItem>>> {
    try {
      return right(await this.dataSource.listComments(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createComment(
    data: CreateCommentParams,
  ): Promise<Either<Failure, CommentItem>> {
    try {
      return right(await this.dataSource.createComment(data));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async togglePostReaction(
    params: TogglePostReactionParams,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.togglePostReaction(params);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async togglePostBookmark(
    params: TogglePostBookmarkParams,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.togglePostBookmark(params);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
