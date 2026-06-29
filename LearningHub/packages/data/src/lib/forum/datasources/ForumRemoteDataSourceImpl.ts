import axios from 'axios';
import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  ForumDetailResponse,
  ForumListItem,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumsParams,
  PaginatedResponse,
  PostListItem,
  TogglePostBookmarkParams,
  TogglePostReactionParams,
} from '@learning-hub/domain';
import { handleAxiosError } from '@learning-hub/core';
import { IForumRemoteDataSource } from './IForumRemoteDataSource';

export class ForumRemoteDataSourceImpl implements IForumRemoteDataSource {
  private token?: string;

  private api = axios.create({
    baseURL: process.env.NEST_API_URL || 'http://localhost:8080',
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
      const res = await this.api.get(`/api/forums?${query.toString()}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getForumDetail(slug: string): Promise<ForumDetailResponse> {
    try {
      const res = await this.api.get(`/api/forums/${slug}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createForum(data: CreateForumParams): Promise<ForumListItem> {
    try {
      const res = await this.api.post('/api/forums', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async joinForum(forumId: string, message: string | undefined): Promise<void> {
    try {
      await this.api.post(`/api/forums/${forumId}/join`, { message });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async leaveForum(forumId: string): Promise<void> {
    try {
      await this.api.delete(`/api/forums/${forumId}/leave`);
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
      const res = await this.api.get(
        `/api/forums/${params.forumId}/posts?${query.toString()}`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createPost(data: CreatePostParams): Promise<PostListItem> {
    try {
      const res = await this.api.post(
        `/api/forums/${data.forumId}/posts`,
        data,
      );
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
        `/api/forums/${params.forumId}/posts/${params.postId}/comments?${query.toString()}`,
      );
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createComment(data: CreateCommentParams): Promise<CommentItem> {
    try {
      const res = await this.api.post(
        `/api/forums/${data.forumId}/posts/${data.postId}/comments`,
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
        url: `/api/forums/${params.forumId}/posts/${params.postId}/reactions`,
        data: { emoji: params.emoji },
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async togglePostBookmark(params: TogglePostBookmarkParams): Promise<void> {
    try {
      await this.api({
        method: params.add ? 'POST' : 'DELETE',
        url: `/api/posts/${params.postId}/bookmarks`,
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
