/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForumModerationController } from './forum-moderation.controller';
import {
  CreateReportUseCase,
  DismissReportUseCase,
  GetForumReportsUseCase,
  GetPostReportsUseCase,
  ResolveReportUseCase,
} from '../../application/use-cases/forum-report.use-case';
import {
  HideCommentUseCase,
  HidePostUseCase,
  RestoreCommentUseCase,
  RestorePostUseCase,
} from '../../application/use-cases/moderation.use-case';

const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumModerationController', () => {
  let controller: ForumModerationController;
  let createReportUseCase: { execute: jest.Mock };
  let getForumReportsUseCase: { execute: jest.Mock };
  let getPostReportsUseCase: { execute: jest.Mock };
  let resolveReportUseCase: { execute: jest.Mock };
  let dismissReportUseCase: { execute: jest.Mock };
  let hidePostUseCase: { execute: jest.Mock };
  let restorePostUseCase: { execute: jest.Mock };
  let hideCommentUseCase: { execute: jest.Mock };
  let restoreCommentUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumModerationController],
      providers: [
        { provide: CreateReportUseCase, useValue: mockUseCase() },
        { provide: GetForumReportsUseCase, useValue: mockUseCase() },
        { provide: GetPostReportsUseCase, useValue: mockUseCase() },
        { provide: ResolveReportUseCase, useValue: mockUseCase() },
        { provide: DismissReportUseCase, useValue: mockUseCase() },
        { provide: HidePostUseCase, useValue: mockUseCase() },
        { provide: RestorePostUseCase, useValue: mockUseCase() },
        { provide: HideCommentUseCase, useValue: mockUseCase() },
        { provide: RestoreCommentUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumModerationController>(
      ForumModerationController,
    );
    createReportUseCase = module.get(CreateReportUseCase);
    getForumReportsUseCase = module.get(GetForumReportsUseCase);
    getPostReportsUseCase = module.get(GetPostReportsUseCase);
    resolveReportUseCase = module.get(ResolveReportUseCase);
    dismissReportUseCase = module.get(DismissReportUseCase);
    hidePostUseCase = module.get(HidePostUseCase);
    restorePostUseCase = module.get(RestorePostUseCase);
    hideCommentUseCase = module.get(HideCommentUseCase);
    restoreCommentUseCase = module.get(RestoreCommentUseCase);
  });

  describe('POST /reports', () => {
    it('should create report', async () => {
      createReportUseCase.execute.mockResolvedValue({ id: 'report-1' });
      const result = await controller.createReport(
        { targetType: 'post', targetId: 'post-1', reason: 'spam' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ id: 'report-1' });
      expect(createReportUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'post',
        'post-1',
        'spam',
        undefined,
      );
    });
  });

  describe('GET /forums/:forumId/reports', () => {
    it('should return report list for mod', async () => {
      getForumReportsUseCase.execute.mockResolvedValue([{ id: 'report-1' }]);
      const result = await controller.listReports(
        'forum-1',
        undefined,
        undefined,
        1,
        10,
      );
      expect(result).toEqual([{ id: 'report-1' }]);
    });

    it('should throw ForbiddenException when not mod', async () => {
      getForumReportsUseCase.execute.mockRejectedValue(
        new ForbiddenException(),
      );
      await expect(
        controller.listReports('forum-1', undefined, undefined, 1, 10),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /forums/:forumId/posts/:postId/reports', () => {
    it('should return reports for a post', async () => {
      getPostReportsUseCase.execute.mockResolvedValue([{ id: 'report-1' }]);
      const result = await controller.getPostReports('forum-1', 'post-1');
      expect(result).toEqual([{ id: 'report-1' }]);
    });
  });

  describe('PATCH /forums/:forumId/reports/:reportId/resolve', () => {
    it('should resolve report', async () => {
      resolveReportUseCase.execute.mockResolvedValue({ status: 'resolved' });
      const result = await controller.resolveReport(
        'forum-1',
        'report-1',
        { resolutionNote: 'handled' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ status: 'resolved' });
    });

    it('should throw NotFoundException for unknown report', async () => {
      resolveReportUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.resolveReport('forum-1', 'nope', {} as any, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /forums/:forumId/reports/:reportId/dismiss', () => {
    it('should dismiss report', async () => {
      dismissReportUseCase.execute.mockResolvedValue({ status: 'dismissed' });
      const result = await controller.dismissReport(
        'forum-1',
        'report-1',
        { note: 'not valid' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ status: 'dismissed' });
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/hide', () => {
    it('should hide post', async () => {
      hidePostUseCase.execute.mockResolvedValue({ hidden: true });
      const result = await controller.hidePost(
        'forum-1',
        'post-1',
        { reasonCode: 'spam' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ hidden: true });
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/restore', () => {
    it('should restore post', async () => {
      restorePostUseCase.execute.mockResolvedValue({ hidden: false });
      const result = await controller.restorePost(
        'forum-1',
        'post-1',
        mockReq as any,
      );
      expect(result).toEqual({ hidden: false });
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/comments/:commentId/hide', () => {
    it('should hide comment', async () => {
      hideCommentUseCase.execute.mockResolvedValue({ hidden: true });
      const result = await controller.hideComment(
        'forum-1',
        'comment-1',
        { reasonCode: 'spam' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ hidden: true });
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/comments/:commentId/restore', () => {
    it('should restore comment', async () => {
      restoreCommentUseCase.execute.mockResolvedValue({ hidden: false });
      const result = await controller.restoreComment(
        'forum-1',
        'comment-1',
        mockReq as any,
      );
      expect(result).toEqual({ hidden: false });
    });
  });
});
