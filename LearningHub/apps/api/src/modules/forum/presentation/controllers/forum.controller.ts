import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateForumUseCase } from '../../application/use-cases/create-forum.use-case';
import { GetForumListUseCase } from '../../application/use-cases/get-forum-list.use-case';
import { GetForumDetailUseCase } from '../../application/use-cases/get-forum-detail.use-case';
import { UpdateForumUseCase } from '../../application/use-cases/update-forum.use-case';
import { DeleteForumUseCase } from '../../application/use-cases/delete-forum.use-case';
import { SetForumRulesUseCase } from '../../application/use-cases/set-forum-rules.use-case';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import {
  CreateForumDto,
  SetForumRulesDto,
  UpdateForumDto,
} from '../dto/forum.request.dto';
import { AuthReq } from '../types';

@ApiTags('Forum')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('forums')
export class ForumController {
  constructor(
    private readonly createForumUseCase: CreateForumUseCase,
    private readonly getForumListUseCase: GetForumListUseCase,
    private readonly getForumDetailUseCase: GetForumDetailUseCase,
    private readonly updateForumUseCase: UpdateForumUseCase,
    private readonly deleteForumUseCase: DeleteForumUseCase,
    private readonly setForumRulesUseCase: SetForumRulesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo diễn đàn mới' })
  create(@Body() dto: CreateForumDto, @Request() req: AuthReq) {
    return this.createForumUseCase.execute(
      {
        ...dto,
        visibility: dto.visibility as
          | 'public'
          | 'private'
          | 'hidden'
          | undefined,
      },
      req.user.id,
    );
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách diễn đàn công khai' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Request() req?: AuthReq,
  ) {
    return this.getForumListUseCase.execute({
      page,
      limit,
      search,
      userId: req?.user?.id,
    });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết diễn đàn theo slug' })
  detail(@Param('slug') slug: string, @Request() req: AuthReq) {
    const authHeader = (req as any).headers?.authorization as
      | string
      | undefined;
    return this.getForumDetailUseCase.execute(slug, req.user?.id, authHeader);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật diễn đàn (chỉ owner)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateForumDto,
    @Request() req: AuthReq,
  ) {
    return this.updateForumUseCase.execute(
      id,
      {
        ...dto,
        visibility: dto.visibility as
          | 'public'
          | 'private'
          | 'hidden'
          | undefined,
      },
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa diễn đàn (chỉ owner)' })
  remove(@Param('id') id: string, @Request() req: AuthReq) {
    return this.deleteForumUseCase.execute(id, req.user.id);
  }

  @Put(':id/rules')
  @ApiOperation({ summary: 'Cập nhật luật diễn đàn (chỉ owner)' })
  setRules(
    @Param('id') id: string,
    @Body() dto: SetForumRulesDto,
    @Request() req: AuthReq,
  ) {
    return this.setForumRulesUseCase.execute(id, dto.rules, req.user.id);
  }
}
