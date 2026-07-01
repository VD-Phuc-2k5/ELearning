import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
  CreateReportUseCase,
  DismissReportUseCase,
  GetForumReportsUseCase,
  ResolveReportUseCase,
} from '../../application/use-cases/forum-report.use-case';
import {
  HideCommentUseCase,
  HidePostUseCase,
  RestoreCommentUseCase,
  RestorePostUseCase,
} from '../../application/use-cases/moderation.use-case';
import type { ReportTargetType } from '../../domain/entities/forum-report.domain';
import {
  CreateReportDto,
  DismissReportDto,
  HideContentDto,
  ResolveReportDto,
} from '../dto/forum-moderation.request.dto';
import { AuthReq } from '../types';

@ApiTags('Forum Moderation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumModerationController {
  constructor(
    private readonly createReportUseCase: CreateReportUseCase,
    private readonly getForumReportsUseCase: GetForumReportsUseCase,
    private readonly resolveReportUseCase: ResolveReportUseCase,
    private readonly dismissReportUseCase: DismissReportUseCase,
    private readonly hidePostUseCase: HidePostUseCase,
    private readonly restorePostUseCase: RestorePostUseCase,
    private readonly hideCommentUseCase: HideCommentUseCase,
    private readonly restoreCommentUseCase: RestoreCommentUseCase,
  ) {}

  @Post('reports')
  @ApiOperation({ summary: 'Tạo báo cáo forum/post/comment' })
  createReport(@Body() dto: CreateReportDto, @Request() req: AuthReq) {
    return this.createReportUseCase.execute(
      req.user.id,
      dto.targetType as ReportTargetType,
      dto.targetId,
      dto.reason,
      dto.description,
    );
  }

  @Get('forums/:forumId/reports')
  @ApiOperation({ summary: 'Danh sách báo cáo trong forum (mod)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'targetType', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listReports(
    @Param('forumId') forumId: string,
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getForumReportsUseCase.execute({
      forumId,
      status,
      targetType,
      page,
      limit,
    });
  }

  @Patch('forums/:forumId/reports/:reportId/resolve')
  @ApiOperation({ summary: 'Giải quyết báo cáo (mod)' })
  resolveReport(
    @Param('forumId') forumId: string,
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
    @Request() req: AuthReq,
  ) {
    return this.resolveReportUseCase.execute(
      forumId,
      reportId,
      req.user.id,
      dto.resolutionNote,
    );
  }

  @Patch('forums/:forumId/reports/:reportId/dismiss')
  @ApiOperation({ summary: 'Bỏ qua báo cáo (mod)' })
  dismissReport(
    @Param('forumId') forumId: string,
    @Param('reportId') reportId: string,
    @Body() dto: DismissReportDto,
    @Request() req: AuthReq,
  ) {
    return this.dismissReportUseCase.execute(
      forumId,
      reportId,
      req.user.id,
      dto.note,
    );
  }

  @Patch('forums/:forumId/posts/:postId/hide')
  @ApiOperation({ summary: 'Ẩn bài viết (mod/owner) - post-moderation' })
  hidePost(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() dto: HideContentDto,
    @Request() req: AuthReq,
  ) {
    return this.hidePostUseCase.execute(
      forumId,
      postId,
      req.user.id,
      dto.reasonCode,
      dto.reasonText,
    );
  }

  @Patch('forums/:forumId/posts/:postId/restore')
  @ApiOperation({ summary: 'Khôi phục bài viết (mod/owner)' })
  restorePost(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Request() req: AuthReq,
  ) {
    return this.restorePostUseCase.execute(forumId, postId, req.user.id);
  }

  @Patch('forums/:forumId/posts/:postId/comments/:commentId/hide')
  @ApiOperation({ summary: 'Ẩn bình luận (mod/owner)' })
  hideComment(
    @Param('forumId') forumId: string,
    @Param('commentId') commentId: string,
    @Body() dto: HideContentDto,
    @Request() req: AuthReq,
  ) {
    return this.hideCommentUseCase.execute(
      forumId,
      commentId,
      req.user.id,
      dto.reasonCode,
      dto.reasonText,
    );
  }

  @Patch('forums/:forumId/posts/:postId/comments/:commentId/restore')
  @ApiOperation({ summary: 'Khôi phục bình luận (mod/owner)' })
  restoreComment(
    @Param('forumId') forumId: string,
    @Param('commentId') commentId: string,
    @Request() req: AuthReq,
  ) {
    return this.restoreCommentUseCase.execute(forumId, commentId, req.user.id);
  }
}
