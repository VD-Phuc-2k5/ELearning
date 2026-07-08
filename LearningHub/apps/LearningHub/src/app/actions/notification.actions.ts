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

const noParams = {} as NoParams;

export async function listNotifications(
  unreadOnly?: boolean,
  page = 1,
  limit = 20,
): Promise<NotificationsPage> {
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
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
  const repo = new NotificationRepositoryImpl(
    new NotificationRemoteDataSourceImpl(),
  );
  const result = await new CountUnreadNotificationsUsecase(repo).execute(
    noParams,
  );
  if (result.type === 'right') return result.value;
  return 0;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    const repo = new NotificationRepositoryImpl(
      new NotificationRemoteDataSourceImpl(),
    );
    const result = await new MarkNotificationReadUsecase(repo).execute(id);
    if (result.type === 'left' && result.value instanceof NetworkFailure)
      return false;
    if (result.type === 'left') throw new Error(result.value.message);
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const repo = new NotificationRepositoryImpl(
      new NotificationRemoteDataSourceImpl(),
    );
    const result = await new MarkAllNotificationsReadUsecase(repo).execute(
      noParams,
    );
    if (result.type === 'left' && result.value instanceof NetworkFailure)
      return false;
    if (result.type === 'left') throw new Error(result.value.message);
    return true;
  } catch {
    return false;
  }
}

export async function deleteReadNotifications(): Promise<void> {
  try {
    const repo = new NotificationRepositoryImpl(
      new NotificationRemoteDataSourceImpl(),
    );
    const result = await new DeleteReadNotificationsUsecase(repo).execute(
      noParams,
    );
    if (result.type === 'left' && result.value instanceof NetworkFailure)
      return;
    if (result.type === 'left') throw new Error(result.value.message);
  } catch {
    // silently ignore
  }
}
