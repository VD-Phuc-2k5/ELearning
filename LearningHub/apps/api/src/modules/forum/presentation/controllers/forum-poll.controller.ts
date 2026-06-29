import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VotePollUseCase } from '../../application/use-cases/vote-poll.use-case';
import { RemovePollVoteUseCase } from '../../application/use-cases/remove-poll-vote.use-case';
import { VotePollDto } from '../dto/forum-post.request.dto';
import { AuthReq } from '../types';

@ApiTags('Forum Polls')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumPollController {
  constructor(
    private readonly votePollUseCase: VotePollUseCase,
    private readonly removePollVoteUseCase: RemovePollVoteUseCase,
  ) {}

  @Post('forums/:forumId/posts/:postId/poll/vote')
  @ApiOperation({ summary: 'Bầu chọn trong poll' })
  vote(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Body() dto: VotePollDto,
    @Request() req: AuthReq,
  ) {
    return this.votePollUseCase.execute(
      forumId,
      postId,
      dto.optionIds,
      req.user.id,
    );
  }

  @Delete('forums/:forumId/posts/:postId/poll/vote')
  @ApiOperation({ summary: 'Hủy vote trong poll' })
  removeVote(
    @Param('forumId') forumId: string,
    @Param('postId') postId: string,
    @Request() req: AuthReq,
  ) {
    return this.removePollVoteUseCase.execute(forumId, postId, req.user.id);
  }
}
