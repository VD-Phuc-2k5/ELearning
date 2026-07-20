/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ForumNotificationController } from './forum-notification.controller';
import {
  CountUnreadNotificationsUseCase,
  DeleteReadNotificationsUseCase,
  GetMyNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from '../../application/use-cases/forum-notification.use-case';

const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumNotificationController', () => {
  let controller: ForumNotificationController;
  let listUseCase: { execute: jest.Mock };
  let markReadUseCase: { execute: jest.Mock };
  let markAllReadUseCase: { execute: jest.Mock };
  let unreadCountUseCase: { execute: jest.Mock };
  let deleteReadUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumNotificationController],
      providers: [
        { provide: GetMyNotificationsUseCase, useValue: mockUseCase() },
        { provide: MarkNotificationReadUseCase, useValue: mockUseCase() },
        { provide: MarkAllNotificationsReadUseCase, useValue: mockUseCase() },
        { provide: CountUnreadNotificationsUseCase, useValue: mockUseCase() },
        { provide: DeleteReadNotificationsUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumNotificationController>(
      ForumNotificationController,
    );
    listUseCase = module.get(GetMyNotificationsUseCase);
    markReadUseCase = module.get(MarkNotificationReadUseCase);
    markAllReadUseCase = module.get(MarkAllNotificationsReadUseCase);
    unreadCountUseCase = module.get(CountUnreadNotificationsUseCase);
    deleteReadUseCase = module.get(DeleteReadNotificationsUseCase);
  });

  describe('GET /me/forum-notifications', () => {
    it('should return notifications', async () => {
      listUseCase.execute.mockResolvedValue([{ id: 'n1' }]);
      const result = await controller.list(mockReq as any, false, 1, 10);
      expect(result).toEqual([{ id: 'n1' }]);
      expect(listUseCase.execute).toHaveBeenCalledWith('user-1', false, 1, 10);
    });
  });

  describe('GET /me/forum-notifications/unread-count', () => {
    it('should return unread count', async () => {
      unreadCountUseCase.execute.mockResolvedValue({ count: 3 });
      const result = await controller.unreadCount(mockReq as any);
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('PATCH /me/forum-notifications/:id/read', () => {
    it('should mark one notification read', async () => {
      markReadUseCase.execute.mockResolvedValue({ read: true });
      const result = await controller.markRead('n1', mockReq as any);
      expect(result).toEqual({ read: true });
      expect(markReadUseCase.execute).toHaveBeenCalledWith('n1', 'user-1');
    });
  });

  describe('PATCH /me/forum-notifications/read-all', () => {
    it('should mark all read', async () => {
      markAllReadUseCase.execute.mockResolvedValue({ updated: 5 });
      const result = await controller.markAllRead(mockReq as any);
      expect(result).toEqual({ updated: 5 });
    });
  });

  describe('DELETE /me/forum-notifications/read', () => {
    it('should delete read notifications', async () => {
      deleteReadUseCase.execute.mockResolvedValue({ deleted: 5 });
      const result = await controller.deleteRead(mockReq as any);
      expect(result).toEqual({ deleted: 5 });
    });
  });
});
