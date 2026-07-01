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
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { GetPostsUseCase } from '../../application/use-cases/get-posts.use-case';
import { GetPostDetailUseCase } from '../../application/use-cases/get-post-detail.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { PinPostUseCase } from '../../application/use-cases/pin-post.use-case';
import { LockPostUseCase } from '../../application/use-cases/lock-post.use-case';
import type { PostType } from '../../domain/entities/forum-post.domain';
import { CreatePostDto, UpdatePostDto } from '../dto/forum-post.request.dto';
import { AuthReq } from '../types';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@ApiTags('Forum Posts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumPostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getPostsUseCase: GetPostsUseCase,
    private readonly getPostDetailUseCase: GetPostDetailUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly pinPostUseCase: PinPostUseCase,
    private readonly lockPostUseCase: LockPostUseCase,
  ) {}

  @Post('forums/:forumId/posts')
  @ApiOperation({ summary: 'Tạo bài viết trong diễn đàn' })
  create(
    @Param('forumId') forumId: string,
    @Body() dto: CreatePostDto,
    @Request() req: AuthReq,
  ) {
    console.log(
      '[API createPost] received content:',
      JSON.stringify(dto.content).substring(0, 500),
    );
    return this.createPostUseCase.execute(
      forumId,
      {
        title: dto.title,
        content: dto.content,
        postType: dto.postType as PostType | undefined,
        tagIds: dto.tagIds,
        poll: dto.poll
          ? {
              question: dto.poll.question,
              options: dto.poll.options,
              endsAt: dto.poll.endsAt ? new Date(dto.poll.endsAt) : undefined,
              isMultipleChoice: dto.poll.isMultipleChoice,
            }
          : undefined,
        roadmapId: dto.roadmapId,
        questionBankId: dto.questionBankId,
      },
      req.user.id,
    );
  }

  @Public()
  @Get('forums/:forumId/posts')
  @ApiOperation({ summary: 'Danh sách bài viết trong diễn đàn' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  list(
    @Param('forumId') forumId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('tagId') tagId?: number,
  ) {
    return this.getPostsUseCase.execute({
      forumId,
      page,
      limit,
      search,
      tagId: tagId !== undefined ? Number(tagId) : undefined,
    });
  }

  @Public()
  @Get('forums/:forumId/posts/:postId')
  @ApiOperation({ summary: 'Chi tiết bài viết' })
  detail(@Param('forumId') forumId: string, @Param('postId') postId: string) {
    return this.getPostDetailUseCase.execute(forumId, postId);
  }

  @Patch('forums/:forumId/posts/:postId')
  @ApiOperation({ summary: 'Cập nhật bài viết (tác giả/mod)' })
  update(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
    @Request() req: AuthReq,
  ) {
    return this.updatePostUseCase.execute(
      forumId,
      postId,
      { title: dto.title, content: dto.content, tagIds: dto.tagIds },
      req.user.id,
    );
  }

  @Delete('forums/:forumId/posts/:postId')
  @ApiOperation({ summary: 'Xóa mềm bài viết (tác giả/mod)' })
  remove(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Request() req: AuthReq,
  ) {
    return this.deletePostUseCase.execute(forumId, postId, req.user.id);
  }

  @Patch('forums/:forumId/posts/:postId/pin')
  @ApiOperation({ summary: 'Ghim/Bỏ ghim bài viết (mod/owner)' })
  pin(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() body: { pin: boolean },
    @Request() req: AuthReq,
  ) {
    return this.pinPostUseCase.execute(forumId, postId, req.user.id, body.pin);
  }

  @Patch('forums/:forumId/posts/:postId/lock')
  @ApiOperation({ summary: 'Khóa/Mở khóa comment (mod/owner)' })
  lock(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() body: { lock: boolean },
    @Request() req: AuthReq,
  ) {
    return this.lockPostUseCase.execute(
      forumId,
      postId,
      req.user.id,
      body.lock,
    );
  }
}
