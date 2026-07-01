import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { GetReactionsUseCase } from '../../application/use-cases/get-reactions.use-case';
import { ToggleReactionUseCase } from '../../application/use-cases/toggle-reaction.use-case';
import { ToggleBookmarkUseCase } from '../../application/use-cases/toggle-bookmark.use-case';
import { GetBookmarksUseCase } from '../../application/use-cases/get-bookmarks.use-case';
import { ToggleReactionDto } from '../dto/forum-interaction.request.dto';
import type { ReactionTargetType } from '../../domain/entities/forum-reaction.domain';
import { AuthReq } from '../types';

@ApiTags('Forum Interactions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumInteractionController {
  constructor(
    private readonly toggleReactionUseCase: ToggleReactionUseCase,
    private readonly toggleBookmarkUseCase: ToggleBookmarkUseCase,
    private readonly getBookmarksUseCase: GetBookmarksUseCase,
    private readonly getReactionsUseCase: GetReactionsUseCase,
  ) {}

  @Post('forums/:forumId/posts/:postId/reactions')
  @ApiOperation({ summary: 'Thêm reaction cho bài viết' })
  addPostReaction(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() dto: ToggleReactionDto,
    @Request() req: AuthReq,
  ) {
    return this.toggleReactionUseCase.execute(
      forumId,
      'post' as ReactionTargetType,
      postId,
      req.user.id,
      dto.emoji,
      true,
    );
  }

  @Delete('forums/:forumId/posts/:postId/reactions')
  @ApiOperation({ summary: 'Bỏ reaction cho bài viết' })
  removePostReaction(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() dto: ToggleReactionDto,
    @Request() req: AuthReq,
  ) {
    return this.toggleReactionUseCase.execute(
      forumId,
      'post' as ReactionTargetType,
      postId,
      req.user.id,
      dto.emoji,
      false,
    );
  }

  @Get('forums/:forumId/posts/:postId/reactions')
  @ApiOperation({
    summary: 'Danh sách reactions của bài viết (theo nhóm emoji)',
  })
  getPostReactions(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Request() req: AuthReq,
  ) {
    return this.getReactionsUseCase.execute(
      'post' as ReactionTargetType,
      postId,
      req.user.id,
    );
  }

  @Post('forums/:forumId/posts/:postId/comments/:commentId/reactions')
  @ApiOperation({ summary: 'Thêm reaction cho bình luận' })
  addCommentReaction(
    @Param('forumId') forumId: string,
    @Param('commentId') commentId: string,
    @Body() dto: ToggleReactionDto,
    @Request() req: AuthReq,
  ) {
    return this.toggleReactionUseCase.execute(
      forumId,
      'comment' as ReactionTargetType,
      commentId,
      req.user.id,
      dto.emoji,
      true,
    );
  }

  @Get('forums/:forumId/posts/:postId/comments/:commentId/reactions')
  @ApiOperation({
    summary: 'Danh sách reactions của bình luận (theo nhóm emoji)',
  })
  getCommentReactions(
    @Param('forumId') forumId: string,
    @Param('commentId') commentId: string,
    @Request() req: AuthReq,
  ) {
    return this.getReactionsUseCase.execute(
      'comment' as ReactionTargetType,
      commentId,
      req.user.id,
    );
  }

  @Delete('forums/:forumId/posts/:postId/comments/:commentId/reactions')
  @ApiOperation({ summary: 'Bỏ reaction cho bình luận' })
  removeCommentReaction(
    @Param('forumId') forumId: string,
    @Param('commentId') commentId: string,
    @Body() dto: ToggleReactionDto,
    @Request() req: AuthReq,
  ) {
    return this.toggleReactionUseCase.execute(
      forumId,
      'comment' as ReactionTargetType,
      commentId,
      req.user.id,
      dto.emoji,
      false,
    );
  }

  @Post('posts/:postId/bookmarks')
  @ApiOperation({ summary: 'Lưu bài viết' })
  addBookmark(@Param('postId') postId: string, @Request() req: AuthReq) {
    return this.toggleBookmarkUseCase.execute(req.user.id, postId, true);
  }

  @Delete('posts/:postId/bookmarks')
  @ApiOperation({ summary: 'Bỏ lưu bài viết' })
  removeBookmark(@Param('postId') postId: string, @Request() req: AuthReq) {
    return this.toggleBookmarkUseCase.execute(req.user.id, postId, false);
  }

  @Get('me/forum-bookmarks')
  @ApiOperation({ summary: 'Danh sách bài viết đã lưu' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  bookmarks(
    @Request() req: AuthReq,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getBookmarksUseCase.execute(req.user.id, page, limit);
  }
}
