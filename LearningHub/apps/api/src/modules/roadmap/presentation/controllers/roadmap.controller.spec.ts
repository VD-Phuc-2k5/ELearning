/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { RoadmapController } from './roadmap.controller';
import { CreateRoadmapUseCase } from '../../application/use-cases/create-roadmap.use-case';
import { GetRoadmapListUseCase } from '../../application/use-cases/get-roadmap-list.use-case';
import { GetRoadmapDetailUseCase } from '../../application/use-cases/get-roadmap-detail.use-case';
import { UpdateRoadmapUseCase } from '../../application/use-cases/update-roadmap.use-case';
import { DeleteRoadmapUseCase } from '../../application/use-cases/delete-roadmap.use-case';
import { SetRoadmapItemsUseCase } from '../../application/use-cases/set-roadmap-items.use-case';
import { EnrollRoadmapUseCase } from '../../application/use-cases/enroll-roadmap.use-case';
import { GetMyRoadmapProgressUseCase } from '../../application/use-cases/get-my-roadmap-progress.use-case';

const mockReq = { user: { id: 'user-1' } };
const mockRoadmap = { id: 'rm-1', title: 'My Roadmap', description: 'desc' };
const mockFn = () => ({ execute: jest.fn() });

describe('RoadmapController (TC044, TC046–TC054)', () => {
  let controller: RoadmapController;
  let createUseCase: { execute: jest.Mock };
  let listUseCase: { execute: jest.Mock };
  let detailUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };
  let setItemsUseCase: { execute: jest.Mock };
  let enrollUseCase: { execute: jest.Mock };
  let progressUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapController],
      providers: [
        { provide: CreateRoadmapUseCase, useValue: mockFn() },
        { provide: GetRoadmapListUseCase, useValue: mockFn() },
        { provide: GetRoadmapDetailUseCase, useValue: mockFn() },
        { provide: UpdateRoadmapUseCase, useValue: mockFn() },
        { provide: DeleteRoadmapUseCase, useValue: mockFn() },
        { provide: SetRoadmapItemsUseCase, useValue: mockFn() },
        { provide: EnrollRoadmapUseCase, useValue: mockFn() },
        { provide: GetMyRoadmapProgressUseCase, useValue: mockFn() },
      ],
    }).compile();

    controller = module.get<RoadmapController>(RoadmapController);
    createUseCase = module.get(CreateRoadmapUseCase);
    listUseCase = module.get(GetRoadmapListUseCase);
    detailUseCase = module.get(GetRoadmapDetailUseCase);
    updateUseCase = module.get(UpdateRoadmapUseCase);
    deleteUseCase = module.get(DeleteRoadmapUseCase);
    setItemsUseCase = module.get(SetRoadmapItemsUseCase);
    enrollUseCase = module.get(EnrollRoadmapUseCase);
    progressUseCase = module.get(GetMyRoadmapProgressUseCase);
  });

  describe('POST /roadmaps (TC044)', () => {
    it('TC044 — should create roadmap and return it', async () => {
      createUseCase.execute.mockResolvedValue(mockRoadmap);
      const result = await controller.create(
        { title: 'My Roadmap', description: 'desc' },
        mockReq as any,
      );
      expect(result).toEqual(mockRoadmap);
      expect(createUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My Roadmap' }),
        'user-1',
      );
    });
  });

  describe('GET /roadmaps (TC046)', () => {
    it('TC046 — should return list of roadmaps', async () => {
      listUseCase.execute.mockResolvedValue([mockRoadmap]);
      const result = await controller.list();
      expect(result).toEqual([mockRoadmap]);
    });
  });

  describe('GET /roadmaps/:id (TC047)', () => {
    it('TC047 — should return roadmap detail', async () => {
      detailUseCase.execute.mockResolvedValue(mockRoadmap);
      const result = await controller.detail('rm-1', mockReq as any);
      expect(result).toEqual(mockRoadmap);
    });
  });

  describe('PATCH /roadmaps/:id (TC048)', () => {
    it('TC048 — should update and return updated roadmap', async () => {
      const updated = { ...mockRoadmap, title: 'Updated' };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.update(
        'rm-1',
        { title: 'Updated' } as any,
        mockReq as any,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /roadmaps/:id (TC049)', () => {
    it('TC049 — should delete roadmap successfully', async () => {
      deleteUseCase.execute.mockResolvedValue({ deleted: true });
      const result = await controller.remove('rm-1', mockReq as any);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('PUT /roadmaps/:id/items (TC050–TC051)', () => {
    it('TC050 — should set items with approved bank ids', async () => {
      setItemsUseCase.execute.mockResolvedValue({
        items: ['bank-1', 'bank-2'],
      });
      const result = await controller.setItems(
        'rm-1',
        { bankIds: ['bank-1', 'bank-2'] } as any,
        mockReq as any,
      );
      expect(result).toEqual({ items: ['bank-1', 'bank-2'] });
    });

    it('TC051 — should throw BadRequestException for unapproved bank in items', async () => {
      setItemsUseCase.execute.mockRejectedValue(
        new BadRequestException('Bank not approved'),
      );
      await expect(
        controller.setItems(
          'rm-1',
          { bankIds: ['pending-bank'] } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /roadmaps/:id/enroll (TC052–TC053)', () => {
    it('TC052 — should enroll user in roadmap successfully', async () => {
      enrollUseCase.execute.mockResolvedValue({ enrolled: true });
      const result = await controller.enroll('rm-1', mockReq as any);
      expect(result).toEqual({ enrolled: true });
    });

    it('TC053 — should throw ConflictException when already enrolled', async () => {
      enrollUseCase.execute.mockRejectedValue(
        new ConflictException('Already enrolled'),
      );
      await expect(controller.enroll('rm-1', mockReq as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('GET /roadmaps/my-progress (TC054)', () => {
    it('TC054 — should return progress data for enrolled user', async () => {
      const progress = [
        { roadmapId: 'rm-1', completedBanks: 2, totalBanks: 5 },
      ];
      progressUseCase.execute.mockResolvedValue(progress);
      const result = await controller.myProgress(mockReq as any);
      expect(result).toEqual(progress);
    });
  });
});
