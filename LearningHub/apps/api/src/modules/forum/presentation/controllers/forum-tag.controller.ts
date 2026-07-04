import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListTagsUseCase } from '../../application/use-cases/list-tags.use-case';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from '../../application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from '../../application/use-cases/delete-tag.use-case';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { CreateForumTagDto } from '../dto/create-forum-tag.dto';
import { UpdateForumTagDto } from '../dto/update-forum-tag.dto';
import { AuthReq } from '../types';

@ApiTags('Forum Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('forum-tags')
export class ForumTagController {
  constructor(
    private readonly listTagsUseCase: ListTagsUseCase,
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly updateTagUseCase: UpdateTagUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách tag' })
  list() {
    return this.listTagsUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tag mới' })
  create(@Body() dto: CreateForumTagDto, @Request() req: AuthReq) {
    return this.createTagUseCase.execute(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tag' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateForumTagDto,
  ) {
    return this.updateTagUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tag' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: AuthReq) {
    return this.deleteTagUseCase.execute(id, req.user.id);
  }
}
