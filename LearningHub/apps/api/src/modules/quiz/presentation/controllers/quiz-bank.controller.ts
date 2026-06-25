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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuestionBankUseCase } from '../../application/use-cases/create-question-bank.use-case';
import { GetQuestionBankListUseCase } from '../../application/use-cases/get-question-bank-list.use-case';
import { GetQuestionsForQuizUseCase } from '../../application/use-cases/get-questions-for-quiz.use-case';
import { VerifyQuestionAnswerUseCase } from '../../application/use-cases/verify-question-answer.use-case';
import { SubmitQuizUseCase } from '../../application/use-cases/submit-quiz.use-case';
import {
  CreateQuestionBankRequestDto,
  UploadQuestionsRequestDto,
  VerifyQuestionAnswerRequestDto,
  SubmitQuizRequestDto,
} from '../dto/quiz.request.dto';
import { Inject } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';

@ApiTags('Quiz - Ngân hàng câu hỏi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz')
export class QuizBankController {
  constructor(
    private readonly createQuestionBankUseCase: CreateQuestionBankUseCase,
    private readonly getQuestionBankListUseCase: GetQuestionBankListUseCase,
    private readonly getQuestionsForQuizUseCase: GetQuestionsForQuizUseCase,
    private readonly verifyQuestionAnswerUseCase: VerifyQuestionAnswerUseCase,
    private readonly submitQuizUseCase: SubmitQuizUseCase,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  // ─── Ngân hàng câu hỏi ───────────────────────────────────────────────────

  @Post('banks')
  @ApiOperation({ summary: 'Tạo mới một ngân hàng câu hỏi (Admin/Uploader)' })
  async createBank(
    @Body() dto: CreateQuestionBankRequestDto,
    @Request() req: any,
  ) {
    return this.createQuestionBankUseCase.execute(dto, req.user.id);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Lấy danh sách ngân hàng câu hỏi (có phân trang & lọc)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  @ApiQuery({ name: 'statusId', required: false, type: String })
  async getBankList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('tagId') tagId?: number,
    @Query('statusId') statusId?: string,
  ) {
    return this.getQuestionBankListUseCase.execute({ page, limit, search, tagId, statusId });
  }

  @Post('banks/:id/upload')
  @ApiOperation({ summary: 'Thêm câu hỏi vào ngân hàng (Admin/Uploader)' })
  async uploadQuestions(
    @Param('id') bankId: string,
    @Body() dto: UploadQuestionsRequestDto,
  ) {
    await this.questionRepository.createMany(
      dto.questions.map((q) => ({
        questionBankId: bankId,
        content: q.content,
        explanation: q.explanation,
        answerOptions: q.answerOptions,
        correctOptionLabels: q.correctOptionLabels,
      })),
    );
    const questions = await this.questionRepository.findByBankId(bankId, false);
    await this.questionBankRepository.updateTotalQuestions(bankId, questions.length);
    return { message: `Đã thêm ${dto.questions.length} câu hỏi thành công.` };
  }

  // ─── Thi thử & Luyện tập ─────────────────────────────────────────────────

  @Get('banks/:id/questions')
  @ApiOperation({
    summary: 'Lấy danh sách câu hỏi để làm bài (đáp án đúng bị ẩn)',
  })
  async getQuestionsForQuiz(@Param('id') bankId: string) {
    return this.getQuestionsForQuizUseCase.execute(bankId);
  }

  @Post('questions/:id/verify')
  @ApiOperation({ summary: 'Kiểm tra nhanh đáp án 1 câu (Practice Mode)' })
  async verifyAnswer(
    @Param('id') questionId: string,
    @Body() dto: VerifyQuestionAnswerRequestDto,
  ) {
    return this.verifyQuestionAnswerUseCase.execute(questionId, dto);
  }

  @Post('banks/:id/submit')
  @ApiOperation({ summary: 'Nộp toàn bộ bài thi và nhận kết quả chi tiết' })
  async submitQuiz(
    @Param('id') bankId: string,
    @Body() dto: SubmitQuizRequestDto,
  ) {
    return this.submitQuizUseCase.execute(bankId, dto);
  }
}
