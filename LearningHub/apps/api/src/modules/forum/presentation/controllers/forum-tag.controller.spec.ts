/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ForumTagController } from './forum-tag.controller';
import { ListTagsUseCase } from '../../application/use-cases/list-tags.use-case';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from '../../application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from '../../application/use-cases/delete-tag.use-case';

const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumTagController', () => {
  let controller: ForumTagController;
  let listUseCase: { execute: jest.Mock };
  let createUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumTagController],
      providers: [
        { provide: ListTagsUseCase, useValue: mockUseCase() },
        { provide: CreateTagUseCase, useValue: mockUseCase() },
        { provide: UpdateTagUseCase, useValue: mockUseCase() },
        { provide: DeleteTagUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumTagController>(ForumTagController);
    listUseCase = module.get(ListTagsUseCase);
    createUseCase = module.get(CreateTagUseCase);
    updateUseCase = module.get(UpdateTagUseCase);
    deleteUseCase = module.get(DeleteTagUseCase);
  });

  describe('GET /forum-tags', () => {
    it('should return tag list', async () => {
      listUseCase.execute.mockResolvedValue([{ id: 1, name: 'general' }]);
      const result = await controller.list();
      expect(result).toEqual([{ id: 1, name: 'general' }]);
    });
  });

  describe('POST /forum-tags', () => {
    it('should create tag', async () => {
      createUseCase.execute.mockResolvedValue({ id: 1, name: 'general' });
      const result = await controller.create(
        { name: 'general' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ id: 1, name: 'general' });
      expect(createUseCase.execute).toHaveBeenCalledWith(
        { name: 'general' },
        'user-1',
      );
    });

    it('should throw ConflictException for duplicate tag', async () => {
      createUseCase.execute.mockRejectedValue(new ConflictException());
      await expect(
        controller.create({ name: 'general' } as any, mockReq as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('PATCH /forum-tags/:id', () => {
    it('should update tag', async () => {
      updateUseCase.execute.mockResolvedValue({ id: 1, name: 'updated' });
      const result = await controller.update(1, { name: 'updated' } as any);
      expect(result).toEqual({ id: 1, name: 'updated' });
      expect(updateUseCase.execute).toHaveBeenCalledWith(1, {
        name: 'updated',
      });
    });
  });

  describe('DELETE /forum-tags/:id', () => {
    it('should delete tag', async () => {
      deleteUseCase.execute.mockResolvedValue({ deleted: true });
      const result = await controller.remove(1, mockReq as any);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw ForbiddenException when not authorized', async () => {
      deleteUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(controller.remove(1, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
