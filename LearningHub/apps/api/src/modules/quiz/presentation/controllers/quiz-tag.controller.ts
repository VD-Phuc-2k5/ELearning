import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { ITagRepository, TAG_REPOSITORY } from '../../domain/repositories/tag.repository.interface';
import { CreateTagRequestDto, UpdateTagRequestDto } from '../dto/quiz.request.dto';

@ApiTags('Quiz - Tags')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz/tags')
export class QuizTagController {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách tag' })
  async getAllTags() {
    return this.tagRepository.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tag mới (Admin)' })
  async createTag(@Body() dto: CreateTagRequestDto) {
    return this.tagRepository.create(dto.name, dto.description);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tag (Admin)' })
  async updateTag(
    @Param('id') id: number,
    @Body() dto: UpdateTagRequestDto,
  ) {
    return this.tagRepository.update(id, dto.name, dto.description);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tag (Admin)' })
  async deleteTag(@Param('id') id: number) {
    await this.tagRepository.delete(id);
    return { message: 'Đã xóa tag thành công.' };
  }
}
