import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ForumSearchController } from './forum-search.controller';
import { SearchForumUseCase } from '../../application/use-cases/search-forum.use-case';

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumSearchController', () => {
  let controller: ForumSearchController;
  let searchUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumSearchController],
      providers: [{ provide: SearchForumUseCase, useValue: mockUseCase() }],
    }).compile();

    controller = module.get<ForumSearchController>(ForumSearchController);
    searchUseCase = module.get(SearchForumUseCase);
  });

  describe('GET /forum-search', () => {
    it('should return search results', async () => {
      searchUseCase.execute.mockResolvedValue({ forums: [], posts: [] });
      const result = await controller.search('nestjs', 'all', undefined, 1, 10);
      expect(result).toEqual({ forums: [], posts: [] });
      expect(searchUseCase.execute).toHaveBeenCalledWith({
        query: 'nestjs',
        type: 'all',
        forumId: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should throw BadRequestException for missing query', async () => {
      searchUseCase.execute.mockRejectedValue(new BadRequestException());
      await expect(
        controller.search('', undefined, undefined, undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
