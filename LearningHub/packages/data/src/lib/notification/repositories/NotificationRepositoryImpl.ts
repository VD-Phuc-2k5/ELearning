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
  INotificationRepository,
  ListNotificationsParams,
  NotificationsPage,
} from '@learning-hub/domain';
import { INotificationRemoteDataSource } from '../datasources/INotificationRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure(e.message);
  if (e instanceof NotFoundException) return new NotFoundFailure(e.message);
  if (e instanceof BadRequestException) return new UnknownFailure(e.message);
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure(e instanceof Error ? e.message : undefined);
}

export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(
    private dataSource: INotificationRemoteDataSource,
    token?: string,
  ) {
    if (token) this.dataSource.setToken(token);
  }

  async listNotifications(
    params: ListNotificationsParams,
  ): Promise<Either<Failure, NotificationsPage>> {
    try {
      return right(await this.dataSource.listNotifications(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getUnreadCount(): Promise<Either<Failure, number>> {
    try {
      return right(await this.dataSource.getUnreadCount());
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async markRead(id: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.markRead(id);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async markAllRead(): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.markAllRead();
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteRead(): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteRead();
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
