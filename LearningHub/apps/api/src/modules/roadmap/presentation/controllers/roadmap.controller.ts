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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateRoadmapUseCase } from '../../application/use-cases/create-roadmap.use-case';
import { GetRoadmapListUseCase } from '../../application/use-cases/get-roadmap-list.use-case';
import { GetRoadmapDetailUseCase } from '../../application/use-cases/get-roadmap-detail.use-case';
import { UpdateRoadmapUseCase } from '../../application/use-cases/update-roadmap.use-case';
import { DeleteRoadmapUseCase } from '../../application/use-cases/delete-roadmap.use-case';
import { SetRoadmapItemsUseCase } from '../../application/use-cases/set-roadmap-items.use-case';
import { EnrollRoadmapUseCase } from '../../application/use-cases/enroll-roadmap.use-case';
import { GetMyRoadmapProgressUseCase } from '../../application/use-cases/get-my-roadmap-progress.use-case';
import {
  CreateRoadmapDto,
  UpdateRoadmapDto,
  SetRoadmapItemsDto,
} from '../dto/roadmap.request.dto';
import { AuthReq } from '../types';

@ApiTags('Roadmap')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('roadmaps')
export class RoadmapController {
  constructor(
    private readonly createRoadmapUseCase: CreateRoadmapUseCase,
    private readonly getRoadmapListUseCase: GetRoadmapListUseCase,
    private readonly getRoadmapDetailUseCase: GetRoadmapDetailUseCase,
    private readonly updateRoadmapUseCase: UpdateRoadmapUseCase,
    private readonly deleteRoadmapUseCase: DeleteRoadmapUseCase,
    private readonly setRoadmapItemsUseCase: SetRoadmapItemsUseCase,
    private readonly enrollRoadmapUseCase: EnrollRoadmapUseCase,
    private readonly getMyRoadmapProgressUseCase: GetMyRoadmapProgressUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo roadmap mới' })
  create(@Body() dto: CreateRoadmapDto, @Request() req: AuthReq) {
    return this.createRoadmapUseCase.execute(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách roadmap' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.getRoadmapListUseCase.execute({ page, limit, search, status });
  }

  @Get('my-progress')
  @ApiOperation({ summary: 'Tất cả tiến độ học roadmap của tôi' })
  myProgress(@Request() req: AuthReq) {
    return this.getMyRoadmapProgressUseCase.execute(req.user.id);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Danh sách roadmap do tôi tạo' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  mine(
    @Request() req: AuthReq,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.getRoadmapListUseCase.execute({
      creatorId: req.user.id,
      page,
      limit,
      search,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết roadmap + tiến độ của user' })
  detail(@Param('id') id: string, @Request() req: AuthReq) {
    return this.getRoadmapDetailUseCase.execute(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật roadmap' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoadmapDto,
    @Request() req: AuthReq,
  ) {
    return this.updateRoadmapUseCase.execute(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa roadmap' })
  remove(@Param('id') id: string, @Request() req: AuthReq) {
    return this.deleteRoadmapUseCase.execute(id, req.user.id);
  }

  @Put(':id/items')
  @ApiOperation({
    summary: 'Cập nhật danh sách question bank trong roadmap (replace toàn bộ)',
  })
  setItems(
    @Param('id') id: string,
    @Body() dto: SetRoadmapItemsDto,
    @Request() req: AuthReq,
  ) {
    return this.setRoadmapItemsUseCase.execute(id, dto.bankIds, req.user.id);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Bắt đầu học roadmap (tạo progress)' })
  enroll(@Param('id') id: string, @Request() req: AuthReq) {
    return this.enrollRoadmapUseCase.execute(id, req.user.id);
  }
}
