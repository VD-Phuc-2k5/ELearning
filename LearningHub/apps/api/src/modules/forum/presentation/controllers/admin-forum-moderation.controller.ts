import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminGetAllReportsUseCase,
  AdminResolveReportUseCase,
  AdminDismissReportUseCase,
  AdminHidePostUseCase,
  AdminRestorePostUseCase,
} from '../../application/use-cases/admin-moderation.use-case';
import {
  DismissReportDto,
  HideContentDto,
  ResolveReportDto,
} from '../dto/forum-moderation.request.dto';
import type { AuthReq } from '../types';

@ApiTags('Admin Moderation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminForumModerationController {
  constructor(
    private readonly getAllReportsUseCase: AdminGetAllReportsUseCase,
    private readonly resolveReportUseCase: AdminResolveReportUseCase,
    private readonly dismissReportUseCase: AdminDismissReportUseCase,
    private readonly hidePostUseCase: AdminHidePostUseCase,
    private readonly restorePostUseCase: AdminRestorePostUseCase,
  ) {}

  @Get('reports')
  @ApiOperation({
    summary: 'Lấy tất cả báo cáo (admin) - kèm thông tin bài viết',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'targetType', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listReports(
    @Request() req: AuthReq,
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getAllReportsUseCase.execute(req.user.id, {
      status,
      targetType,
      page: page ?? 1,
      limit: limit ?? 20,
    });
  }

  @Patch('reports/:reportId/resolve')
  @ApiOperation({ summary: 'Giải quyết báo cáo (admin)' })
  resolveReport(
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
    @Request() req: AuthReq,
  ) {
    return this.resolveReportUseCase.execute(
      req.user.id,
      reportId,
      dto.resolutionNote,
    );
  }

  @Patch('reports/:reportId/dismiss')
  @ApiOperation({ summary: 'Bỏ qua báo cáo (admin)' })
  dismissReport(
    @Param('reportId') reportId: string,
    @Body() dto: DismissReportDto,
    @Request() req: AuthReq,
  ) {
    return this.dismissReportUseCase.execute(req.user.id, reportId, dto.note);
  }

  @Patch('posts/:postId/hide')
  @ApiOperation({ summary: 'Ẩn bài viết (admin)' })
  hidePost(
    @Param('postId') postId: string,
    @Body() dto: HideContentDto,
    @Request() req: AuthReq,
  ) {
    return this.hidePostUseCase.execute(
      req.user.id,
      postId,
      dto.reasonCode,
      dto.reasonText,
    );
  }

  @Patch('posts/:postId/restore')
  @ApiOperation({ summary: 'Khôi phục bài viết (admin)' })
  restorePost(@Param('postId') postId: string, @Request() req: AuthReq) {
    return this.restorePostUseCase.execute(req.user.id, postId);
  }
}
