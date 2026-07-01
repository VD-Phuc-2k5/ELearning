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
  BadRequestException,
  PermissionException,
  NotFoundException,
  NetworkException,
} from '@learning-hub/core';
import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  CreateTagParams,
  ForumDetailResponse,
  ForumListItem,
  ForumTag,
  GetReactionsResult,
  GetTargetReactionsParams,
  IForumRepository,
  JoinForumParams,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumsParams,
  MemberSuggestion,
  PaginatedResponse,
  PostDetail,
  PostListItem,
  SearchMembersParams,
  SetForumRulesParams,
  ToggleCommentReactionParams,
  TogglePostBookmarkParams,
  TogglePostReactionParams,
  UpdateCommentParams,
  UpdateForumParams,
  UpdatePostParams,
  UpdateTagParams,
  UploadImageResult,
} from '@learning-hub/domain';
import { IForumRemoteDataSource } from '../datasources/IForumRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure(e.message);
  if (e instanceof NotFoundException) return new NotFoundFailure(e.message);
  if (e instanceof BadRequestException) return new UnknownFailure(e.message);
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure(e instanceof Error ? e.message : undefined);
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

  async updateForum(
    params: UpdateForumParams,
  ): Promise<Either<Failure, ForumListItem>> {
    try {
      return right(await this.dataSource.updateForum(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async setForumRules(
    params: SetForumRulesParams,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.setForumRules(params);
      return right(undefined);
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

  async toggleCommentReaction(
    params: ToggleCommentReactionParams,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.toggleCommentReaction(params);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getTargetReactions(
    params: GetTargetReactionsParams,
  ): Promise<Either<Failure, GetReactionsResult>> {
    try {
      const result =
        params.targetType === 'post'
          ? await this.dataSource.getPostReactions(
              params.forumId,
              params.targetId,
            )
          : await this.dataSource.getCommentReactions(
              params.forumId,
              params.postId!,
              params.targetId,
            );
      return right(result);
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

  async getPostDetail(
    forumId: string,
    postId: string,
  ): Promise<Either<Failure, PostDetail>> {
    try {
      return right(await this.dataSource.getPostDetail(forumId, postId));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updatePost(
    params: UpdatePostParams,
  ): Promise<Either<Failure, PostListItem>> {
    try {
      return right(await this.dataSource.updatePost(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deletePost(
    forumId: string,
    postId: string,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deletePost(forumId, postId);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async listTags(): Promise<Either<Failure, ForumTag[]>> {
    try {
      return right(await this.dataSource.listTags());
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createTag(data: CreateTagParams): Promise<Either<Failure, ForumTag>> {
    try {
      return right(await this.dataSource.createTag(data));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateTag(params: UpdateTagParams): Promise<Either<Failure, ForumTag>> {
    try {
      return right(await this.dataSource.updateTag(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteTag(id: number): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteTag(id);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateComment(
    params: UpdateCommentParams,
  ): Promise<Either<Failure, CommentItem>> {
    try {
      return right(await this.dataSource.updateComment(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteComment(
    forumId: string,
    postId: string,
    commentId: string,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteComment(forumId, postId, commentId);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async uploadImage(
    formData: FormData,
  ): Promise<Either<Failure, UploadImageResult>> {
    try {
      return right(await this.dataSource.uploadImage(formData));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async searchMembers(
    params: SearchMembersParams,
  ): Promise<Either<Failure, MemberSuggestion[]>> {
    try {
      return right(await this.dataSource.searchMembers(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
