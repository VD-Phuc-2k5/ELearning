/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ForumPollController } from './forum-poll.controller';
import { VotePollUseCase } from '../../application/use-cases/vote-poll.use-case';
import { RemovePollVoteUseCase } from '../../application/use-cases/remove-poll-vote.use-case';

const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumPollController', () => {
  let controller: ForumPollController;
  let voteUseCase: { execute: jest.Mock };
  let removeVoteUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumPollController],
      providers: [
        { provide: VotePollUseCase, useValue: mockUseCase() },
        { provide: RemovePollVoteUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumPollController>(ForumPollController);
    voteUseCase = module.get(VotePollUseCase);
    removeVoteUseCase = module.get(RemovePollVoteUseCase);
  });

  describe('POST /forums/:forumId/posts/:postId/poll/vote', () => {
    it('should cast a poll vote', async () => {
      voteUseCase.execute.mockResolvedValue({ voted: true });
      const result = await controller.vote(
        'forum-1',
        'post-1',
        { optionIds: ['opt-1'] } as any,
        mockReq as any,
      );
      expect(result).toEqual({ voted: true });
      expect(voteUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post-1',
        ['opt-1'],
        'user-1',
      );
    });

    it('should throw BadRequestException for closed poll', async () => {
      voteUseCase.execute.mockRejectedValue(new BadRequestException());
      await expect(
        controller.vote(
          'forum-1',
          'post-1',
          { optionIds: ['opt-1'] } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for unknown poll', async () => {
      voteUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.vote(
          'forum-1',
          'nope',
          { optionIds: ['opt-1'] } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /forums/:forumId/posts/:postId/poll/vote', () => {
    it('should remove poll vote', async () => {
      removeVoteUseCase.execute.mockResolvedValue({ voted: false });
      const result = await controller.removeVote(
        'forum-1',
        'post-1',
        mockReq as any,
      );
      expect(result).toEqual({ voted: false });
      expect(removeVoteUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'post-1',
        'user-1',
      );
    });
  });
});
