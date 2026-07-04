import axios from 'axios';
import {
  ListNotificationsParams,
  NotificationsPage,
} from '@learning-hub/domain';
import { handleAxiosError } from '@learning-hub/core';
import { getServerCookies } from '../../serverCookies';
import { INotificationRemoteDataSource } from './INotificationRemoteDataSource';

export class NotificationRemoteDataSourceImpl
  implements INotificationRemoteDataSource
{
  private api = axios.create({
    baseURL:
      process.env.NEST_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8080/api',
    timeout: 10000,
    withCredentials: true,
  });

  constructor() {
    this.api.interceptors.request.use(async (config) => {
      config.headers.Cookie = await getServerCookies();
      return config;
    });
  }

  async listNotifications(
    params: ListNotificationsParams,
  ): Promise<NotificationsPage> {
    try {
      const query: Record<string, string> = {};
      if (params.unreadOnly) query.unreadOnly = 'true';
      if (params.page && params.page > 1) query.page = String(params.page);
      if (params.limit && params.limit !== 20)
        query.limit = String(params.limit);
      const res = await this.api.get('/me/forum-notifications', {
        params: query,
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const res = await this.api.get('/me/forum-notifications/unread-count');
      return typeof res.data === 'number' ? res.data : (res.data?.count ?? 0);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async markRead(id: string): Promise<void> {
    try {
      await this.api.patch(`/me/forum-notifications/${id}/read`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async markAllRead(): Promise<void> {
    try {
      await this.api.patch('/me/forum-notifications/read-all');
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteRead(): Promise<void> {
    try {
      await this.api.delete('/me/forum-notifications/read');
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
