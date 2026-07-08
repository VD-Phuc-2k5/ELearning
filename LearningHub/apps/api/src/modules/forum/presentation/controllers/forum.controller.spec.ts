import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { CreateForumUseCase } from '../../application/use-cases/create-forum.use-case';
import { GetForumListUseCase } from '../../application/use-cases/get-forum-list.use-case';
import { GetForumDetailUseCase } from '../../application/use-cases/get-forum-detail.use-case';
import { UpdateForumUseCase } from '../../application/use-cases/update-forum.use-case';
import { DeleteForumUseCase } from '../../application/use-cases/delete-forum.use-case';
import { SetForumRulesUseCase } from '../../application/use-cases/set-forum-rules.use-case';

const mockForum = { id: 'forum-1', name: 'Test Forum' };
const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumController', () => {
  let controller: ForumController;
  let createUseCase: { execute: jest.Mock };
  let listUseCase: { execute: jest.Mock };
  let detailUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };
  let setRulesUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumController],
      providers: [
        { provide: CreateForumUseCase, useValue: mockUseCase() },
        { provide: GetForumListUseCase, useValue: mockUseCase() },
        { provide: GetForumDetailUseCase, useValue: mockUseCase() },
        { provide: UpdateForumUseCase, useValue: mockUseCase() },
        { provide: DeleteForumUseCase, useValue: mockUseCase() },
        { provide: SetForumRulesUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumController>(ForumController);
    createUseCase = module.get(CreateForumUseCase);
    listUseCase = module.get(GetForumListUseCase);
    detailUseCase = module.get(GetForumDetailUseCase);
    updateUseCase = module.get(UpdateForumUseCase);
    deleteUseCase = module.get(DeleteForumUseCase);
    setRulesUseCase = module.get(SetForumRulesUseCase);
  });

  describe('POST /forums', () => {
    it('should create forum and return it', async () => {
      createUseCase.execute.mockResolvedValue(mockForum);
      const result = await controller.create(
        { name: 'Test Forum' } as any,
        mockReq as any,
      );
      expect(result).toEqual(mockForum);
      expect(createUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Forum' }),
        'user-1',
      );
    });
  });

  describe('GET /forums', () => {
    it('should return list of forums', async () => {
      listUseCase.execute.mockResolvedValue([mockForum]);
      const result = await controller.list(1, 10, undefined, mockReq as any);
      expect(result).toEqual([mockForum]);
    });
  });

  describe('GET /forums/:slug', () => {
    it('should return forum detail for valid slug', async () => {
      detailUseCase.execute.mockResolvedValue(mockForum);
      const result = await controller.detail('test-forum', mockReq as any);
      expect(result).toEqual(mockForum);
    });

    it('should throw NotFoundException for unknown slug', async () => {
      detailUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.detail('nope', mockReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /forums/:id', () => {
    it('should update forum for owner', async () => {
      const updated = { ...mockForum, name: 'Updated' };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.update(
        'forum-1',
        { name: 'Updated' } as any,
        mockReq as any,
      );
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when not owner', async () => {
      updateUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.update(
          'forum-1',
          { name: 'Updated' } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /forums/:id', () => {
    it('should delete forum for owner', async () => {
      deleteUseCase.execute.mockResolvedValue({ deleted: true });
      const result = await controller.remove('forum-1', mockReq as any);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('PUT /forums/:id/rules', () => {
    it('should set forum rules', async () => {
      setRulesUseCase.execute.mockResolvedValue({ rules: [] });
      const result = await controller.setRules(
        'forum-1',
        { rules: [] } as any,
        mockReq as any,
      );
      expect(result).toEqual({ rules: [] });
      expect(setRulesUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        [],
        'user-1',
      );
    });
  });
});
