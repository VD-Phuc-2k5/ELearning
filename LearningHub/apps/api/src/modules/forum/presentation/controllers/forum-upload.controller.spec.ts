import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ForumUploadController } from './forum-upload.controller';
import { UploadForumImageUseCase } from '../../application/use-cases/upload-forum-image.use-case';

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumUploadController', () => {
  let controller: ForumUploadController;
  let uploadUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumUploadController],
      providers: [
        { provide: UploadForumImageUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumUploadController>(ForumUploadController);
    uploadUseCase = module.get(UploadForumImageUseCase);
  });

  describe('POST /forums/images', () => {
    it('should upload image and return url', async () => {
      uploadUseCase.execute.mockResolvedValue({ url: 'https://cdn/img.png' });
      const file = { originalname: 'img.png' } as any;
      const result = await controller.uploadImage(file);
      expect(result).toEqual({ url: 'https://cdn/img.png' });
      expect(uploadUseCase.execute).toHaveBeenCalledWith(file);
    });

    it('should throw BadRequestException for invalid file', async () => {
      uploadUseCase.execute.mockRejectedValue(new BadRequestException());
      await expect(controller.uploadImage(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
