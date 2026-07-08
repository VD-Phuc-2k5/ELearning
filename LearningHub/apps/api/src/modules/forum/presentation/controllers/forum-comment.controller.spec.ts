import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ForumCommentController } from './forum-comment.controller';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/get-comments.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';

const mockComment = { id: 'comment-1', content: 'Test Comment' };
const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumCommentController', () => {
  let controller: ForumCommentController;
  let createUseCase: { execute: jest.Mock };
  let listUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumCommentController],
      providers: [
        { provide: CreateCommentUseCase, useValue: mockUseCase() },
        { provide: GetCommentsUseCase, useValue: mockUseCase() },
        { provide: UpdateCommentUseCase, useValue: mockUseCase() },
        { provide: DeleteCommentUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumCommentController>(ForumCommentController);
    createUseCase = module.get(CreateCommentUseCase);
    listUseCase = module.get(GetCommentsUseCase);
    updateUseCase = module.get(UpdateCommentUseCase);
    deleteUseCase = module.get(DeleteCommentUseCase);
  });

  describe('POST /forums/:forumId/posts/:postId/comments', () => {
    it('should create comment and return it', async () => {
      createUseCase.execute.mockResolvedValue(mockComment);
      const result = await controller.create(
        'forum-1',
        'post-1',
        { content: 'Test Comment' } as any,
        mockReq as any,
      );
      expect(result).toEqual(mockComment);
      expect(createUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post-1',
        'Test Comment',
        undefined,
        undefined,
        'user-1',
      );
    });

    it('should throw ForbiddenException when post is locked', async () => {
      createUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.create(
          'forum-1',
          'post-1',
          { content: 'x' } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /forums/:forumId/posts/:postId/comments', () => {
    it('should return list of comments', async () => {
      listUseCase.execute.mockResolvedValue([mockComment]);
      const result = await controller.list('forum-1', 'post-1', 1, 20);
      expect(result).toEqual([mockComment]);
      expect(listUseCase.execute).toHaveBeenCalledWith({
        postId: 'post-1',
        page: 1,
        limit: 20,
      });
    });
  });

  describe('PATCH /forums/:forumId/posts/:postId/comments/:commentId', () => {
    it('should update comment for author', async () => {
      const updated = { ...mockComment, content: 'Updated' };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.update(
        'forum-1',
        'post-1',
        'comment-1',
        { content: 'Updated' } as any,
        mockReq as any,
      );
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException for unknown comment', async () => {
      updateUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.update(
          'forum-1',
          'post-1',
          'nope',
          { content: 'x' } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /forums/:forumId/posts/:postId/comments/:commentId', () => {
    it('should delete comment for author/mod', async () => {
      deleteUseCase.execute.mockResolvedValue({ deleted: true });
      const result = await controller.remove(
        'forum-1',
        'post-1',
        'comment-1',
        mockReq as any,
      );
      expect(result).toEqual({ deleted: true });
    });
  });
});
