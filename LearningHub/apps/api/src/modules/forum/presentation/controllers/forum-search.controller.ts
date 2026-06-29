import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import {
  SearchForumUseCase,
  type SearchForumResult,
} from '../../application/use-cases/search-forum.use-case';

@ApiTags('Forum Search')
@Controller('forum-search')
export class ForumSearchController {
  constructor(private readonly searchForumUseCase: SearchForumUseCase) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Tìm kiếm diễn đàn/bài viết (full-text search)' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'type', required: false, enum: ['forums', 'posts', 'all'] })
  @ApiQuery({ name: 'forumId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(
    @Query('q') q: string,
    @Query('type') type?: 'forums' | 'posts' | 'all',
    @Query('forumId') forumId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<SearchForumResult> {
    return this.searchForumUseCase.execute({
      query: q,
      type,
      forumId,
      page,
      limit,
    });
  }
}
