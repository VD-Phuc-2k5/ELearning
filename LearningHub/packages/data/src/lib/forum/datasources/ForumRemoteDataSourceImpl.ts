import axios from 'axios';
import FormDataNode from 'form-data';
import {
  AdminReportDetail,
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  CreateReportParams,
  CreateTagParams,
  ForumDetailResponse,
  ForumInvite,
  ForumListItem,
  ForumReport,
  ForumTag,
  GetReactionsResult,
  ListAdminReportsParams,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumReportsParams,
  ListPostReportsParams,
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
import { handleAxiosError } from '@learning-hub/core';
import { IForumRemoteDataSource } from './IForumRemoteDataSource';

export class ForumRemoteDataSourceImpl implements IForumRemoteDataSource {
  private token?: string;

  private api = axios.create({
    baseURL:
      process.env.NEST_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8080/api',
    timeout: 15000,
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string): void {
    this.token = token;
  }

  async listForums(
    params: ListForumsParams,
  ): Promise<PaginatedResponse<ForumListItem>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.search) query.set('search', params.search);
      if (params.categoryId) query.set('categoryId', String(params.categoryId));
      const res = await this.api.get(`/forums?${query.toString()}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getForumDetail(slug: string): Promise<ForumDetailResponse> {
    try {
      const res = await this.api.get(`/forums/${slug}`);
      return res.data;
    } catch (e: unknown) {
      const err = e as {
        code?: string;
        message?: string;
        config?: { url?: string };
      };
      console.error(
        '[getForumDetail] ERROR:',
        err?.code,
        err?.message,
        err?.config?.url,
      );
      return handleAxiosError(e);
    }
  }

  async createForum(data: CreateForumParams): Promise<ForumListItem> {
    try {
      const res = await this.api.post('/forums', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateForum(params: UpdateForumParams): Promise<ForumListItem> {
    try {
      const res = await this.api.patch(`/forums/${params.id}`, {
        name: params.name,
        description: params.description,
        visibility: params.visibility,
        bannerUrl: params.bannerUrl,
        iconUrl: params.iconUrl,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteForum(forumId: string): Promise<void> {
    try {
      await this.api.delete(`/forums/${forumId}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async setForumRules(params: SetForumRulesParams): Promise<void> {
    try {
      await this.api.put(`/forums/${params.id}/rules`, {
        rules: params.rules,
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async joinForum(forumId: string, message: string | undefined): Promise<void> {
    try {
      await this.api.post(`/forums/${forumId}/join`, { message });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async leaveForum(forumId: string): Promise<void> {
    try {
      await this.api.delete(`/forums/${forumId}/leave`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async listForumPosts(
    params: ListForumPostsParams,
  ): Promise<PaginatedResponse<PostListItem>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.tagId) query.set('tagId', String(params.tagId));
      if (params.search) query.set('search', params.search);
      const res = await this.api.get(
        `/forums/${params.forumId}/posts?${query.toString()}`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createPost(data: CreatePostParams): Promise<PostListItem> {
    try {
      const res = await this.api.post(`/forums/${data.forumId}/posts`, data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async listComments(
    params: ListCommentsParams,
  ): Promise<PaginatedResponse<CommentItem>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const res = await this.api.get(
        `/forums/${params.forumId}/posts/${params.postId}/comments?${query.toString()}`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createComment(data: CreateCommentParams): Promise<CommentItem> {
    try {
      const res = await this.api.post(
        `/forums/${data.forumId}/posts/${data.postId}/comments`,
        data,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async togglePostReaction(params: TogglePostReactionParams): Promise<void> {
    try {
      await this.api({
        method: params.add ? 'POST' : 'DELETE',
        url: `/forums/${params.forumId}/posts/${params.postId}/reactions`,
        data: { emoji: params.emoji },
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async toggleCommentReaction(
    params: ToggleCommentReactionParams,
  ): Promise<void> {
    try {
      await this.api({
        method: params.add ? 'POST' : 'DELETE',
        url: `/forums/${params.forumId}/posts/${params.postId}/comments/${params.commentId}/reactions`,
        data: { emoji: params.emoji },
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getPostReactions(
    forumId: string,
    postId: string,
  ): Promise<GetReactionsResult> {
    try {
      const res = await this.api.get(
        `/forums/${forumId}/posts/${postId}/reactions`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getCommentReactions(
    forumId: string,
    postId: string,
    commentId: string,
  ): Promise<GetReactionsResult> {
    try {
      const res = await this.api.get(
        `/forums/${forumId}/posts/${postId}/comments/${commentId}/reactions`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async togglePostBookmark(params: TogglePostBookmarkParams): Promise<void> {
    try {
      await this.api({
        method: params.add ? 'POST' : 'DELETE',
        url: `/posts/${params.postId}/bookmarks`,
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getPostDetail(forumId: string, postId: string): Promise<PostDetail> {
    try {
      const res = await this.api.get(`/forums/${forumId}/posts/${postId}`);
      const { post, poll: pollData } = res.data;
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        postType: post.postType,
        status: post.status,
        isPinned: post.isPinned,
        isLocked: post.isLocked,
        commentCount: post.commentCount,
        reactionCount: post.reactionCount,
        viewCount: post.viewCount,
        createdAt: post.createdAt,
        forumId: post.forumId,
        tags: post.tags ?? [],
        poll: pollData
          ? {
              id: pollData.poll.id,
              question: pollData.poll.question,
              isMultipleChoice: pollData.poll.isMultipleChoice,
              endsAt: pollData.poll.endsAt,
              options: (pollData.options ?? []).map(
                (o: Record<string, unknown>) => ({
                  id: o.id,
                  content: o.content,
                  voteCount: o.voteCount,
                  votedByMe: o.votedByMe,
                }),
              ),
            }
          : null,
        author: post.authorId
          ? { id: post.authorId, fullName: post.authorName ?? 'Unknown' }
          : null,
      };
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updatePost(params: UpdatePostParams): Promise<PostListItem> {
    try {
      const res = await this.api.patch(
        `/forums/${params.forumId}/posts/${params.postId}`,
        { title: params.title, content: params.content, tagIds: params.tagIds },
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deletePost(forumId: string, postId: string): Promise<void> {
    try {
      await this.api.delete(`/forums/${forumId}/posts/${postId}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async listTags(): Promise<ForumTag[]> {
    try {
      const res = await this.api.get('/forum-tags');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createTag(data: CreateTagParams): Promise<ForumTag> {
    try {
      const res = await this.api.post('/forum-tags', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateTag(params: UpdateTagParams): Promise<ForumTag> {
    try {
      const res = await this.api.patch(`/forum-tags/${params.id}`, {
        name: params.name,
        color: params.color,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteTag(id: number): Promise<void> {
    try {
      await this.api.delete(`/forum-tags/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateComment(params: UpdateCommentParams): Promise<CommentItem> {
    try {
      const res = await this.api.patch(
        `/forums/${params.forumId}/posts/${params.postId}/comments/${params.commentId}`,
        { content: params.content },
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteComment(
    forumId: string,
    postId: string,
    commentId: string,
  ): Promise<void> {
    try {
      await this.api.delete(
        `/forums/${forumId}/posts/${postId}/comments/${commentId}`,
      );
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async uploadImage(formData: FormData): Promise<UploadImageResult> {
    try {
      const file = formData.get('file') as File | null;
      if (!file) throw new Error('No file in FormData');

      const buffer = Buffer.from(await file.arrayBuffer());
      const nodeFormData = new FormDataNode();
      nodeFormData.append('file', buffer, {
        filename: file.name,
        contentType: file.type,
      });

      const res = await this.api.post('/forums/images', nodeFormData, {
        headers: nodeFormData.getHeaders(),
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async searchMembers(
    params: SearchMembersParams,
  ): Promise<MemberSuggestion[]> {
    const res = await this.api.get<MemberSuggestion[]>(
      `/forums/${params.forumId}/members/search`,
      { params: { q: params.query, limit: params.limit } },
    );
    return res.data;
  }

  async createInvite(
    forumId: string,
    inviteeId?: string,
  ): Promise<ForumInvite> {
    try {
      const res = await this.api.post(`/forums/${forumId}/invites`, {
        inviteeId,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getInvites(
    forumId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<ForumInvite>> {
    try {
      const query = new URLSearchParams();
      if (page) query.set('page', String(page));
      if (limit) query.set('limit', String(limit));
      const res = await this.api.get(
        `/forums/${forumId}/invites?${query.toString()}`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async revokeInvite(forumId: string, inviteId: string): Promise<void> {
    try {
      await this.api.delete(`/forums/${forumId}/invites/${inviteId}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async acceptInvite(token: string): Promise<{
    member: { forumId: string };
    forumId: string;
    forumSlug: string;
  }> {
    try {
      const res = await this.api.post(`/invites/${token}/accept`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createReport(params: CreateReportParams): Promise<ForumReport> {
    try {
      const res = await this.api.post('/reports', params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getReports(
    params: ListForumReportsParams,
  ): Promise<PaginatedResponse<ForumReport>> {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.targetType) query.set('targetType', params.targetType);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const res = await this.api.get(
        `/forums/${params.forumId}/reports?${query.toString()}`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getPostReports(params: ListPostReportsParams): Promise<ForumReport[]> {
    try {
      const res = await this.api.get(
        `/forums/${params.forumId}/posts/${params.postId}/reports`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async resolveReport(
    forumId: string,
    reportId: string,
    resolutionNote: string,
  ): Promise<ForumReport> {
    try {
      const res = await this.api.patch(
        `/forums/${forumId}/reports/${reportId}/resolve`,
        { resolutionNote },
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async dismissReport(
    forumId: string,
    reportId: string,
    note?: string,
  ): Promise<ForumReport> {
    try {
      const res = await this.api.patch(
        `/forums/${forumId}/reports/${reportId}/dismiss`,
        { note },
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async hidePost(
    forumId: string,
    postId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<void> {
    try {
      await this.api.patch(`/forums/${forumId}/posts/${postId}/hide`, {
        reasonCode,
        reasonText,
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async restorePost(forumId: string, postId: string): Promise<void> {
    try {
      await this.api.patch(`/forums/${forumId}/posts/${postId}/restore`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getAdminReports(
    params: ListAdminReportsParams,
  ): Promise<PaginatedResponse<AdminReportDetail>> {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.targetType) query.set('targetType', params.targetType);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const res = await this.api.get(`/admin/reports?${query.toString()}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async adminResolveReport(
    reportId: string,
    resolutionNote: string,
  ): Promise<ForumReport> {
    try {
      const res = await this.api.patch(`/admin/reports/${reportId}/resolve`, {
        resolutionNote,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async adminDismissReport(
    reportId: string,
    note?: string,
  ): Promise<ForumReport> {
    try {
      const res = await this.api.patch(`/admin/reports/${reportId}/dismiss`, {
        note,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async adminHidePost(
    postId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<void> {
    try {
      await this.api.patch(`/admin/posts/${postId}/hide`, {
        reasonCode,
        reasonText,
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async adminRestorePost(postId: string): Promise<void> {
    try {
      await this.api.patch(`/admin/posts/${postId}/restore`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
