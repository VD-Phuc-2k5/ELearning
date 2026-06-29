import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { SaveDraftUseCase } from '../../application/use-cases/save-draft.use-case';
import { ListMyDraftsUseCase } from '../../application/use-cases/list-my-drafts.use-case';
import { PublishDraftUseCase } from '../../application/use-cases/publish-draft.use-case';
import { DeleteDraftUseCase } from '../../application/use-cases/delete-draft.use-case';
import { PublishDraftDto, SaveDraftDto } from '../dto/forum-post.request.dto';
import type { PostType } from '../../domain/entities/forum-post.domain';
import { AuthReq } from '../types';

@ApiTags('Forum Drafts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumDraftController {
  constructor(
    private readonly saveDraftUseCase: SaveDraftUseCase,
    private readonly listMyDraftsUseCase: ListMyDraftsUseCase,
    private readonly publishDraftUseCase: PublishDraftUseCase,
    private readonly deleteDraftUseCase: DeleteDraftUseCase,
  ) {}

  @Get('me/forum-drafts')
  @ApiOperation({ summary: 'Danh sách draft của tôi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @Request() req: AuthReq,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.listMyDraftsUseCase.execute(req.user.id, page, limit);
  }

  @Post('me/forum-drafts')
  @ApiOperation({ summary: 'Tạo draft mới' })
  create(@Body() dto: SaveDraftDto, @Request() req: AuthReq) {
    return this.saveDraftUseCase.execute(
      {
        authorId: req.user.id,
        title: dto.title,
        content: dto.content,
        postType: dto.postType as PostType | undefined,
        forumId: dto.forumId,
      },
      undefined,
    );
  }

  @Put('me/forum-drafts/:id')
  @ApiOperation({ summary: 'Cập nhật draft' })
  update(
    @Param('id') id: string,
    @Body() dto: SaveDraftDto,
    @Request() req: AuthReq,
  ) {
    return this.saveDraftUseCase.execute(
      {
        authorId: req.user.id,
        title: dto.title,
        content: dto.content,
        postType: dto.postType as PostType | undefined,
        forumId: dto.forumId,
      },
      id,
    );
  }

  @Post('me/forum-drafts/:id/publish')
  @ApiOperation({ summary: 'Publish draft → post' })
  publish(
    @Param('id') id: string,
    @Body() dto: PublishDraftDto,
    @Request() req: AuthReq,
  ) {
    return this.publishDraftUseCase.execute(id, req.user.id, dto.forumId);
  }

  @Delete('me/forum-drafts/:id')
  @ApiOperation({ summary: 'Xóa draft' })
  remove(@Param('id') id: string, @Request() req: AuthReq) {
    return this.deleteDraftUseCase.execute(id, req.user.id);
  }
}
