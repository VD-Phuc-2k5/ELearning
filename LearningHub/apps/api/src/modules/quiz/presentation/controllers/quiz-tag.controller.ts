import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetAllTagsUseCase } from '../../application/use-cases/get-all-tags.use-case';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from '../../application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from '../../application/use-cases/delete-tag.use-case';
import {
  CreateTagRequestDto,
  UpdateTagRequestDto,
} from '../dto/quiz.request.dto';

@ApiTags('Quiz - Tags')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz/tags')
export class QuizTagController {
  constructor(
    private readonly getAllTagsUseCase: GetAllTagsUseCase,
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly updateTagUseCase: UpdateTagUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách tag' })
  getAllTags() {
    return this.getAllTagsUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tag mới (Admin)' })
  createTag(@Body() dto: CreateTagRequestDto) {
    return this.createTagUseCase.execute(dto.name, dto.description);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tag (Admin)' })
  updateTag(@Param('id') id: number, @Body() dto: UpdateTagRequestDto) {
    return this.updateTagUseCase.execute(id, dto.name, dto.description);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tag (Admin)' })
  async deleteTag(@Param('id') id: number) {
    await this.deleteTagUseCase.execute(id);
    return { message: 'Đã xóa tag thành công.' };
  }
}
