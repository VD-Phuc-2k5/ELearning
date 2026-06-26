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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateQuestionBankUseCase } from '../../application/use-cases/create-question-bank.use-case';
import { GetQuestionBankListUseCase } from '../../application/use-cases/get-question-bank-list.use-case';
import { GetQuestionsForQuizUseCase } from '../../application/use-cases/get-questions-for-quiz.use-case';
import { VerifyQuestionAnswerUseCase } from '../../application/use-cases/verify-question-answer.use-case';
import { SubmitQuizUseCase } from '../../application/use-cases/submit-quiz.use-case';
import { GetQuestionBankDetailUseCase } from '../../application/use-cases/get-question-bank-detail.use-case';
import { UpdateQuestionBankUseCase } from '../../application/use-cases/update-question-bank.use-case';
import { DeleteQuestionBankUseCase } from '../../application/use-cases/delete-question-bank.use-case';
import { UpdateQuestionUseCase } from '../../application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/use-cases/delete-question.use-case';
import { UploadExcelUseCase } from '../../application/use-cases/upload-excel.use-case';
import { GetUploadHistoryUseCase } from '../../application/use-cases/get-upload-history.use-case';
import {
  CreateQuestionBankRequestDto,
  UploadQuestionsRequestDto,
  VerifyQuestionAnswerRequestDto,
  SubmitQuizRequestDto,
  UpdateQuestionBankRequestDto,
  UpdateQuestionRequestDto,
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
import {
  IUploadRepository,
  UPLOAD_REPOSITORY,
} from '../../domain/repositories/upload.repository.interface';
import { ExcelParserService } from '../../infrastructure/services/excel-parser.service';

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
    private readonly getQuestionBankDetailUseCase: GetQuestionBankDetailUseCase,
    private readonly updateQuestionBankUseCase: UpdateQuestionBankUseCase,
    private readonly deleteQuestionBankUseCase: DeleteQuestionBankUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
    private readonly uploadExcelUseCase: UploadExcelUseCase,
    private readonly getUploadHistoryUseCase: GetUploadHistoryUseCase,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(UPLOAD_REPOSITORY)
    private readonly uploadRepository: IUploadRepository,
    private readonly excelParserService: ExcelParserService,
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
  @ApiOperation({
    summary: 'Lấy danh sách ngân hàng câu hỏi (có phân trang & lọc)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  @ApiQuery({ name: 'statusId', required: false, type: String })
  async getBankList(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('tagId') tagId?: number,
    @Query('statusId') statusId?: string,
  ) {
    return this.getQuestionBankListUseCase.execute({
      page,
      limit,
      search,
      tagId,
      statusId,
      uploaderId: req.user.id,
    });
  }

  @Get('banks/:id')
  @ApiOperation({ summary: 'Xem chi tiết một ngân hàng câu hỏi' })
  async getBankDetail(@Param('id') id: string) {
    return this.getQuestionBankDetailUseCase.execute(id);
  }

  @Get('banks/check-hash/:hash')
  @ApiOperation({ summary: 'Kiểm tra ngân hàng câu hỏi qua mã Hash' })
  async getBankByHash(@Param('hash') hash: string, @Request() req: any) {
    const bank = await this.questionBankRepository.findByHash(
      hash,
      req.user.id,
    );
    return { exists: !!bank, bank };
  }

  @Get('banks/:id/derived-banks')
  @ApiOperation({ summary: 'Thống kê ai đã dùng cùng file với bank này' })
  async getDerivedBanks(@Param('id') id: string, @Request() req: any) {
    const bank = await this.questionBankRepository.findById(id);
    if (!bank || bank.uploaderId !== req.user.id) return { data: [] };
    if (!bank.fileHash) return { data: [] };
    const derived = await this.questionBankRepository.findDerivedBanks(
      bank.fileHash,
      bank.uploaderId,
    );
    // ponytail: first uploader = original owner; if any derived bank predates this one, this is a copy not the original
    const bankCreatedAt = new Date(bank.createdAt);
    const isOriginal = derived.every(
      (d) => new Date(d.createdAt) > bankCreatedAt,
    );
    return isOriginal ? { data: derived } : { data: [] };
  }

  @Patch('banks/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin ngân hàng câu hỏi' })
  async updateBank(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionBankRequestDto,
  ) {
    return this.updateQuestionBankUseCase.execute(id, dto);
  }

  @Delete('banks/:id')
  @ApiOperation({ summary: 'Xóa ngân hàng câu hỏi (cascade xóa câu hỏi)' })
  async deleteBank(@Param('id') id: string) {
    return this.deleteQuestionBankUseCase.execute(id);
  }

  @Post('banks/:id/upload')
  @ApiOperation({ summary: 'Thêm câu hỏi vào ngân hàng (Admin/Uploader)' })
  async uploadQuestions(
    @Param('id') bankId: string,
    @Body() dto: UploadQuestionsRequestDto,
    @Request() req: any,
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
    await this.questionBankRepository.updateTotalQuestions(
      bankId,
      questions.length,
    );

    await this.uploadRepository.create({
      questionBankId: bankId,
      uploadedBy: req.user.id,
      fileName: null,
      totalQuestionsImported: dto.questions.length,
    });

    return { message: `Đã thêm ${dto.questions.length} câu hỏi thành công.` };
  }

  @Post('banks/:id/upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import câu hỏi từ file Excel (.xlsx)' })
  async uploadExcel(
    @Param('id') bankId: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new Error('Vui lòng chọn file Excel để upload.');
    }
    return this.uploadExcelUseCase.execute(
      bankId,
      file.buffer,
      file.originalname,
      req.user.id,
      req.body.fileHash,
    );
  }

  @Post('banks/:id/parse-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Parse file Excel, trả về danh sách câu hỏi để preview (không lưu DB)',
  })
  async parseExcel(@Param('id') _bankId: string, @UploadedFile() file: any) {
    if (!file)
      throw new BadRequestException('Vui lòng chọn file Excel để parse.');
    const questions = await this.excelParserService.parse(file.buffer);
    return { questions };
  }

  @Get('banks/:id/upload-history')
  @ApiOperation({ summary: 'Xem lịch sử import câu hỏi vào ngân hàng' })
  async getUploadHistory(@Param('id') bankId: string) {
    return this.getUploadHistoryUseCase.execute(bankId);
  }

  // ─── Thi thử & Luyện tập ─────────────────────────────────────────────────

  @Get('banks/:id/questions')
  @ApiOperation({
    summary: 'Lấy danh sách câu hỏi (showAnswers=true để lấy đáp án đúng)',
  })
  @ApiQuery({ name: 'showAnswers', required: false, type: Boolean })
  async getQuestionsForQuiz(
    @Param('id') bankId: string,
    @Query('showAnswers') showAnswers?: string,
  ) {
    return this.getQuestionsForQuizUseCase.execute(
      bankId,
      showAnswers === 'true',
    );
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

  @Patch('questions/:id')
  @ApiOperation({ summary: 'Cập nhật nội dung & đáp án một câu hỏi' })
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionRequestDto,
  ) {
    return this.updateQuestionUseCase.execute(id, dto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Xóa một câu hỏi khỏi ngân hàng' })
  async deleteQuestion(@Param('id') id: string) {
    return this.deleteQuestionUseCase.execute(id);
  }
}
