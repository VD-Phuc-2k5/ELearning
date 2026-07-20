/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdminForumModerationController } from './admin-forum-moderation.controller';
import {
  AdminGetAllReportsUseCase,
  AdminResolveReportUseCase,
  AdminDismissReportUseCase,
  AdminHidePostUseCase,
  AdminRestorePostUseCase,
} from '../../application/use-cases/admin-moderation.use-case';

const mockReq = { user: { id: 'admin-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('AdminForumModerationController', () => {
  let controller: AdminForumModerationController;
  let getAllReportsUseCase: { execute: jest.Mock };
  let resolveReportUseCase: { execute: jest.Mock };
  let dismissReportUseCase: { execute: jest.Mock };
  let hidePostUseCase: { execute: jest.Mock };
  let restorePostUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminForumModerationController],
      providers: [
        { provide: AdminGetAllReportsUseCase, useValue: mockUseCase() },
        { provide: AdminResolveReportUseCase, useValue: mockUseCase() },
        { provide: AdminDismissReportUseCase, useValue: mockUseCase() },
        { provide: AdminHidePostUseCase, useValue: mockUseCase() },
        { provide: AdminRestorePostUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<AdminForumModerationController>(
      AdminForumModerationController,
    );
    getAllReportsUseCase = module.get(AdminGetAllReportsUseCase);
    resolveReportUseCase = module.get(AdminResolveReportUseCase);
    dismissReportUseCase = module.get(AdminDismissReportUseCase);
    hidePostUseCase = module.get(AdminHidePostUseCase);
    restorePostUseCase = module.get(AdminRestorePostUseCase);
  });

  describe('GET /admin/reports', () => {
    it('should return all reports for admin', async () => {
      getAllReportsUseCase.execute.mockResolvedValue([{ id: 'report-1' }]);
      const result = await controller.listReports(
        mockReq as any,
        undefined,
        undefined,
        1,
        20,
      );
      expect(result).toEqual([{ id: 'report-1' }]);
      expect(getAllReportsUseCase.execute).toHaveBeenCalledWith('admin-1', {
        status: undefined,
        targetType: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('should throw ForbiddenException when not admin', async () => {
      getAllReportsUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.listReports(mockReq as any, undefined, undefined, 1, 20),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('PATCH /admin/reports/:reportId/resolve', () => {
    it('should resolve report', async () => {
      resolveReportUseCase.execute.mockResolvedValue({ status: 'resolved' });
      const result = await controller.resolveReport(
        'report-1',
        { resolutionNote: 'done' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ status: 'resolved' });
      expect(resolveReportUseCase.execute).toHaveBeenCalledWith(
        'admin-1',
        'report-1',
        'done',
      );
    });

    it('should throw NotFoundException for unknown report', async () => {
      resolveReportUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.resolveReport('nope', {} as any, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /admin/reports/:reportId/dismiss', () => {
    it('should dismiss report', async () => {
      dismissReportUseCase.execute.mockResolvedValue({ status: 'dismissed' });
      const result = await controller.dismissReport(
        'report-1',
        { note: 'invalid' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ status: 'dismissed' });
    });
  });

  describe('PATCH /admin/posts/:postId/hide', () => {
    it('should hide post', async () => {
      hidePostUseCase.execute.mockResolvedValue({ hidden: true });
      const result = await controller.hidePost(
        'post-1',
        { reasonCode: 'spam' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ hidden: true });
    });
  });

  describe('PATCH /admin/posts/:postId/restore', () => {
    it('should restore post', async () => {
      restorePostUseCase.execute.mockResolvedValue({ hidden: false });
      const result = await controller.restorePost('post-1', mockReq as any);
      expect(result).toEqual({ hidden: false });
    });
  });
});
