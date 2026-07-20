/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ForumInteractionController } from './forum-interaction.controller';
import { GetReactionsUseCase } from '../../application/use-cases/get-reactions.use-case';
import { ToggleReactionUseCase } from '../../application/use-cases/toggle-reaction.use-case';
import { ToggleBookmarkUseCase } from '../../application/use-cases/toggle-bookmark.use-case';
import { GetBookmarksUseCase } from '../../application/use-cases/get-bookmarks.use-case';

const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumInteractionController', () => {
  let controller: ForumInteractionController;
  let toggleReactionUseCase: { execute: jest.Mock };
  let toggleBookmarkUseCase: { execute: jest.Mock };
  let getBookmarksUseCase: { execute: jest.Mock };
  let getReactionsUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumInteractionController],
      providers: [
        { provide: ToggleReactionUseCase, useValue: mockUseCase() },
        { provide: ToggleBookmarkUseCase, useValue: mockUseCase() },
        { provide: GetBookmarksUseCase, useValue: mockUseCase() },
        { provide: GetReactionsUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumInteractionController>(
      ForumInteractionController,
    );
    toggleReactionUseCase = module.get(ToggleReactionUseCase);
    toggleBookmarkUseCase = module.get(ToggleBookmarkUseCase);
    getBookmarksUseCase = module.get(GetBookmarksUseCase);
    getReactionsUseCase = module.get(GetReactionsUseCase);
  });

  describe('POST /forums/:forumId/posts/:postId/reactions', () => {
    it('should add reaction to post', async () => {
      toggleReactionUseCase.execute.mockResolvedValue({ added: true });
      const result = await controller.addPostReaction(
        'forum-1',
        'post-1',
        { emoji: '👍' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ added: true });
      expect(toggleReactionUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post',
        'post-1',
        'user-1',
        '👍',
        true,
      );
    });
  });

  describe('DELETE /forums/:forumId/posts/:postId/reactions', () => {
    it('should remove reaction from post', async () => {
      toggleReactionUseCase.execute.mockResolvedValue({ removed: true });
      const result = await controller.removePostReaction(
        'forum-1',
        'post-1',
        { emoji: '👍' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ removed: true });
      expect(toggleReactionUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post',
        'post-1',
        'user-1',
        '👍',
        false,
      );
    });
  });

  describe('GET /forums/:forumId/posts/:postId/reactions', () => {
    it('should return post reactions', async () => {
      getReactionsUseCase.execute.mockResolvedValue([
        { emoji: '👍', count: 3 },
      ]);
      const result = await controller.getPostReactions(
        'forum-1',
        'post-1',
        mockReq as any,
      );
      expect(result).toEqual([{ emoji: '👍', count: 3 }]);
    });

    it('should throw NotFoundException for unknown post', async () => {
      getReactionsUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.getPostReactions('forum-1', 'nope', mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('comment reactions', () => {
    it('should add reaction to comment', async () => {
      toggleReactionUseCase.execute.mockResolvedValue({ added: true });
      const result = await controller.addCommentReaction(
        'forum-1',
        'comment-1',
        { emoji: '❤️' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ added: true });
      expect(toggleReactionUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'comment',
        'comment-1',
        'user-1',
        '❤️',
        true,
      );
    });

    it('should remove reaction from comment', async () => {
      toggleReactionUseCase.execute.mockResolvedValue({ removed: true });
      const result = await controller.removeCommentReaction(
        'forum-1',
        'comment-1',
        { emoji: '❤️' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ removed: true });
    });

    it('should return comment reactions', async () => {
      getReactionsUseCase.execute.mockResolvedValue([
        { emoji: '❤️', count: 1 },
      ]);
      const result = await controller.getCommentReactions(
        'forum-1',
        'comment-1',
        mockReq as any,
      );
      expect(result).toEqual([{ emoji: '❤️', count: 1 }]);
    });
  });

  describe('POST /posts/:postId/bookmarks', () => {
    it('should add bookmark', async () => {
      toggleBookmarkUseCase.execute.mockResolvedValue({ bookmarked: true });
      const result = await controller.addBookmark('post-1', mockReq as any);
      expect(result).toEqual({ bookmarked: true });
      expect(toggleBookmarkUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'post-1',
        true,
      );
    });
  });

  describe('DELETE /posts/:postId/bookmarks', () => {
    it('should remove bookmark', async () => {
      toggleBookmarkUseCase.execute.mockResolvedValue({ bookmarked: false });
      const result = await controller.removeBookmark('post-1', mockReq as any);
      expect(result).toEqual({ bookmarked: false });
      expect(toggleBookmarkUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'post-1',
        false,
      );
    });
  });

  describe('GET /me/forum-bookmarks', () => {
    it('should return bookmarked posts', async () => {
      getBookmarksUseCase.execute.mockResolvedValue([{ id: 'post-1' }]);
      const result = await controller.bookmarks(mockReq as any, 1, 10);
      expect(result).toEqual([{ id: 'post-1' }]);
      expect(getBookmarksUseCase.execute).toHaveBeenCalledWith('user-1', 1, 10);
    });
  });
});
