import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadForumImageUseCase } from '../../application/use-cases/upload-forum-image.use-case';

@ApiTags('Forum Uploads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('forums')
export class ForumUploadController {
  constructor(
    private readonly uploadForumImageUseCase: UploadForumImageUseCase,
  ) {}

  @Post('images')
  @ApiOperation({
    summary: 'Upload ảnh diễn đàn lên Cloudinary (Tiptap embed)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadForumImageUseCase.execute(file);
  }
}
