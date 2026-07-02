'use server';

import {
  NotificationRemoteDataSourceImpl,
  NotificationRepositoryImpl,
} from '@learning-hub/data';
import {
  ListNotificationsUsecase,
  CountUnreadNotificationsUsecase,
  MarkNotificationReadUsecase,
  MarkAllNotificationsReadUsecase,
  DeleteReadNotificationsUsecase,
  type NotificationsPage,
} from '@learning-hub/domain';
import { NetworkFailure, type NoParams } from '@learning-hub/core';
import { cookies } from 'next/headers';

const noParams = {} as NoParams;

async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get('accessToken')?.value ?? store.get('adminToken')?.value;
}

export async function listNotifications(
  unreadOnly?: boolean,
  page = 1,
  limit = 20,
): Promise<NotificationsPage> {
  const token = await getToken();
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
    token,
  );
  const result = await new ListNotificationsUsecase(repo).execute({
    unreadOnly,
    page,
    limit,
  });
  if (result.type === 'right') return result.value;
  return { data: [], total: 0 };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const token = await getToken();
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
    token,
  );
  const result = await new CountUnreadNotificationsUsecase(repo).execute(
    noParams,
  );
  if (result.type === 'right') return result.value;
  return 0;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const token = await getToken();
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
    token,
  );
  const result = await new MarkNotificationReadUsecase(repo).execute(id);
  if (result.type === 'left' && result.value instanceof NetworkFailure)
    return false;
  if (result.type === 'left') throw new Error(result.value.message);
  return true;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const token = await getToken();
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
    token,
  );
  const result = await new MarkAllNotificationsReadUsecase(repo).execute(
    noParams,
  );
  if (result.type === 'left' && result.value instanceof NetworkFailure)
    return false;
  if (result.type === 'left') throw new Error(result.value.message);
  return true;
}

export async function deleteReadNotifications(): Promise<void> {
  const token = await getToken();
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
    token,
  );
  const result = await new DeleteReadNotificationsUsecase(repo).execute(
    noParams,
  );
  if (result.type === 'left' && result.value instanceof NetworkFailure) return;
  if (result.type === 'left') throw new Error(result.value.message);
}
