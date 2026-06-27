import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { SubmitQuizUseCase } from '../../application/use-cases/submit-quiz.use-case';
import { GetQuizAttemptsUseCase } from '../../application/use-cases/get-quiz-attempts.use-case';
import { GetQuizAttemptDetailUseCase } from '../../application/use-cases/get-quiz-attempt-detail.use-case';
import { GetBankProgressUseCase } from '../../application/use-cases/get-bank-progress.use-case';
import { GetBankRoadmapsUseCase } from '../../application/use-cases/get-bank-roadmaps.use-case';
import { SubmitQuizRequestDto } from '../dto/quiz-attempt.request.dto';

interface AuthenticatedRequest {
  user: { id: string };
}

@ApiTags('Quiz - Lịch sử & Tiến độ')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz')
export class QuizAttemptController {
  constructor(
    private readonly submitQuizUseCase: SubmitQuizUseCase,
    private readonly getQuizAttemptsUseCase: GetQuizAttemptsUseCase,
    private readonly getQuizAttemptDetailUseCase: GetQuizAttemptDetailUseCase,
    private readonly getBankProgressUseCase: GetBankProgressUseCase,
    private readonly getBankRoadmapsUseCase: GetBankRoadmapsUseCase,
  ) {}

  @Post('banks/:id/submit')
  @ApiOperation({ summary: 'Nộp toàn bộ bài thi và nhận kết quả chi tiết' })
  async submitQuiz(
    @Param('id') bankId: string,
    @Body() dto: SubmitQuizRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.submitQuizUseCase.execute(bankId, dto, req.user.id);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Lịch sử làm quiz của user hiện tại' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'bankId', required: false })
  async getAttempts(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('bankId') bankId?: string,
  ) {
    return this.getQuizAttemptsUseCase.execute(req.user.id, {
      page,
      limit,
      bankId,
    });
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Chi tiết một lần làm quiz (kèm review từng câu)' })
  async getAttemptDetail(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.getQuizAttemptDetailUseCase.execute(id, req.user.id);
  }

  @Get('banks/:id/my-progress')
  @ApiOperation({ summary: 'Tiến độ học của user cho một question bank' })
  async getBankProgress(
    @Param('id') bankId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.getBankProgressUseCase.execute(bankId, req.user.id);
  }

  @Get('banks/:id/roadmaps')
  @ApiOperation({ summary: 'Danh sách roadmap chứa question bank này' })
  async getBankRoadmaps(@Param('id') bankId: string) {
    return this.getBankRoadmapsUseCase.execute(bankId);
  }
}
