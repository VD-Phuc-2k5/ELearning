import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ForumPostController } from './forum-post.controller';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { GetPostsUseCase } from '../../application/use-cases/get-posts.use-case';
import { GetPostDetailUseCase } from '../../application/use-cases/get-post-detail.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { PinPostUseCase } from '../../application/use-cases/pin-post.use-case';
import { LockPostUseCase } from '../../application/use-cases/lock-post.use-case';

const mockPost = { id: 'post-1', title: 'Test Post' };
const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumPostController', () => {
  let controller: ForumPostController;
  let createUseCase: { execute: jest.Mock };
  let listUseCase: { execute: jest.Mock };
  let detailUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };
  let pinUseCase: { execute: jest.Mock };
  let lockUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumPostController],
      providers: [
        { provide: CreatePostUseCase, useValue: mockUseCase() },
        { provide: GetPostsUseCase, useValue: mockUseCase() },
        { provide: GetPostDetailUseCase, useValue: mockUseCase() },
        { provide: UpdatePostUseCase, useValue: mockUseCase() },
        { provide: DeletePostUseCase, useValue: mockUseCase() },
        { provide: PinPostUseCase, useValue: mockUseCase() },
        { provide: LockPostUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumPostController>(ForumPostController);
    createUseCase = module.get(CreatePostUseCase);
    listUseCase = module.get(GetPostsUseCase);
    detailUseCase = module.get(GetPostDetailUseCase);
    updateUseCase = module.get(UpdatePostUseCase);
    deleteUseCase = module.get(DeletePostUseCase);
    pinUseCase = module.get(PinPostUseCase);
    lockUseCase = module.get(LockPostUseCase);
  });

  describe('POST /forums/:forumId/posts', () => {
    it('should create post and return it', async () => {
      createUseCase.execute.mockResolvedValue(mockPost);
      const result = await controller.create(
        'forum-1',
        { title: 'Test Post', content: 'body' } as any,
        mockReq as any,
      );
      expect(result).toEqual(mockPost);
      expect(createUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        expect.objectContaining({ title: 'Test Post', content: 'body' }),
        'user-1',
      );
    });

    it('should throw ForbiddenException when forum locked/membership required', async () => {
      createUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.create(
          'forum-1',
          { title: 'x', content: 'y' } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /forums/:forumId/posts', () => {
    it('should return list of posts', async () => {
      listUseCase.execute.mockResolvedValue([mockPost]);
      const result = await controller.list(
        'forum-1',
        1,
        10,
        undefined,
        undefined,
      );
      expect(result).toEqual([mockPost]);
      expect(listUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ forumId: 'forum-1', page: 1, limit: 10 }),
      );
    });
  });

  describe('GET /forums/:forumId/posts/:postId', () => {
    it('should return post detail', async () => {
      detailUseCase.execute.mockResolvedValue(mockPost);
      const result = await controller.detail('forum-1', 'post-1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException for unknown post', async () => {
      detailUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.detail('forum-1', 'nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId', () => {
    it('should update post for author', async () => {
      const updated = { ...mockPost, title: 'Updated' };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.update(
        'forum-1',
        'post-1',
        { title: 'Updated' } as any,
        mockReq as any,
      );
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when not author/mod', async () => {
      updateUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.update(
          'forum-1',
          'post-1',
          { title: 'x' } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /forums/:forumId/posts/:postId', () => {
    it('should delete post for author/mod', async () => {
      deleteUseCase.execute.mockResolvedValue({ deleted: true });
      const result = await controller.remove(
        'forum-1',
        'post-1',
        mockReq as any,
      );
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/pin', () => {
    it('should pin post for mod/owner', async () => {
      pinUseCase.execute.mockResolvedValue({ pinned: true });
      const result = await controller.pin(
        'forum-1',
        'post-1',
        { pin: true },
        mockReq as any,
      );
      expect(result).toEqual({ pinned: true });
      expect(pinUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post-1',
        'user-1',
        true,
      );
    });

    it('should throw ForbiddenException when not mod/owner', async () => {
      pinUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.pin('forum-1', 'post-1', { pin: true }, mockReq as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/lock', () => {
    it('should lock post for mod/owner', async () => {
      lockUseCase.execute.mockResolvedValue({ locked: true });
      const result = await controller.lock(
        'forum-1',
        'post-1',
        { lock: true },
        mockReq as any,
      );
      expect(result).toEqual({ locked: true });
      expect(lockUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post-1',
        'user-1',
        true,
      );
    });
  });
});
