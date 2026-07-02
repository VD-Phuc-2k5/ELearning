import {
  Body,
  Controller,
  Delete,
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
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/get-comments.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '../dto/forum-post.request.dto';
import { AuthReq } from '../types';

@ApiTags('Forum Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumCommentController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Post('forums/:forumId/posts/:postId/comments')
  @ApiOperation({ summary: 'Tạo bình luận hoặc trả lời (tối đa 3 cấp)' })
  create(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: AuthReq,
  ) {
    return this.createCommentUseCase.execute(
      forumId,
      postId,
      dto.content,
      dto.parentId,
      dto.mentionIds,
      req.user.id,
    );
  }

  @Get('forums/:forumId/posts/:postId/comments')
  @ApiOperation({ summary: 'Danh sách bình luận theo post (2-query approach)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getCommentsUseCase.execute({ postId, page, limit });
  }

  @Patch('forums/:forumId/posts/:postId/comments/:commentId')
  @ApiOperation({ summary: 'Sửa bình luận (tác giả/mod)' })
  update(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Request() req: AuthReq,
  ) {
    return this.updateCommentUseCase.execute(
      forumId,
      postId,
      commentId,
      dto.content,
      req.user.id,
    );
  }

  @Delete('forums/:forumId/posts/:postId/comments/:commentId')
  @ApiOperation({ summary: 'Xóa mềm bình luận (tác giả/mod)' })
  remove(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req: AuthReq,
  ) {
    return this.deleteCommentUseCase.execute(
      forumId,
      postId,
      commentId,
      req.user.id,
    );
  }
}
