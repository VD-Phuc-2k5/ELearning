'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

export interface NotificationItem {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  type: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  data: NotificationItem[];
  total: number;
}

const baseURL =
  process.env.NEST_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8080/api';

async function getToken(): Promise<string | undefined> {
  return (await cookies()).get('accessToken')?.value;
}

async function api() {
  const token = await getToken();
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function listNotifications(
  unreadOnly?: boolean,
  page = 1,
  limit = 20,
): Promise<NotificationsPage> {
  try {
    const client = await api();
    const params: Record<string, string> = {};
    if (unreadOnly) params.unreadOnly = 'true';
    if (page > 1) params.page = String(page);
    if (limit !== 20) params.limit = String(limit);
    const res = await client.get('/me/forum-notifications', { params });
    return res.data;
  } catch {
    return { data: [], total: 0 };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const client = await api();
    const res = await client.get('/me/forum-notifications/unread-count');
    return typeof res.data === 'number' ? res.data : (res.data?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const client = await api();
    await client.patch(`/me/forum-notifications/${id}/read`);
  } catch {
    /* ignore */
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const client = await api();
    await client.patch('/me/forum-notifications/read-all');
  } catch {
    /* ignore */
  }
}
