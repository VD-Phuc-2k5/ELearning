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
import { CreateProblemUseCase } from '../../application/use-cases/create-problem.use-case';
import { ManageTestCasesUseCase } from '../../application/use-cases/manage-test-cases.use-case';
import { ListProblemsUseCase } from '../../application/use-cases/list-problems.use-case';
import { UpdateProblemUseCase } from '../../application/use-cases/update-problem.use-case';
import { DeleteProblemUseCase } from '../../application/use-cases/delete-problem.use-case';
import { CreateProblemDto } from '../dto/create-problem.dto';
import { CreateTestCaseDto } from '../dto/create-test-case.dto';
interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Coding Problems')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('problems')
export class CodingProblemController {
  constructor(
    private readonly createProblemUseCase: CreateProblemUseCase,
    private readonly manageTestCasesUseCase: ManageTestCasesUseCase,
    private readonly listProblemsUseCase: ListProblemsUseCase,
    private readonly updateProblemUseCase: UpdateProblemUseCase,
    private readonly deleteProblemUseCase: DeleteProblemUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đề bài coding mới (Admin)' })
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateProblemDto) {
    return this.createProblemUseCase.execute(req.user.id, {
      title: dto.title,
      description: dto.description,
      difficulty: dto.difficulty,
      timeLimitMs: dto.timeLimitMs ?? 5000,
      memoryLimitMb: dto.memoryLimitMb ?? 256,
      sampleInput: dto.sampleInput ?? null,
      sampleOutput: dto.sampleOutput ?? null,
      languages: dto.languages,
      templates: dto.templates ?? {},
      wrappers: dto.wrappers ?? {},
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đề bài coding' })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('difficulty') difficulty?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.listProblemsUseCase.execute({
      difficulty,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đề bài coding' })
  findOne(@Param('id') id: string) {
    return this.listProblemsUseCase.getById(id);
  }

  @Post(':id/test-cases')
  @ApiOperation({ summary: 'Thêm test case mới cho đề bài (Admin)' })
  createTestCase(
    @Request() req: AuthenticatedRequest,
    @Param('id') problemId: string,
    @Body() dto: CreateTestCaseDto,
  ) {
    return this.manageTestCasesUseCase.createTestCase(req.user.id, problemId, {
      input: dto.input,
      expectedOutput: dto.expectedOutput,
      isHidden: dto.isHidden ?? true,
      orderIndex: dto.orderIndex ?? 0,
      points: dto.points ?? 1,
    });
  }

  @Get(':id/test-cases')
  @ApiOperation({ summary: 'Lấy danh sách testcase của đề bài (Admin)' })
  getTestCases(
    @Request() req: AuthenticatedRequest,
    @Param('id') problemId: string,
  ) {
    return this.manageTestCasesUseCase.getTestCases(req.user.id, problemId);
  }

  @Delete(':problemId/test-cases/:id')
  @ApiOperation({ summary: 'Xóa test case (Admin)' })
  deleteTestCase(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.manageTestCasesUseCase.deleteTestCase(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đề bài coding (Admin)' })
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProblemDto>,
  ) {
    return this.updateProblemUseCase.execute(req.user.id, id, {
      title: dto.title,
      description: dto.description,
      difficulty: dto.difficulty,
      timeLimitMs: dto.timeLimitMs,
      memoryLimitMb: dto.memoryLimitMb,
      sampleInput: dto.sampleInput,
      sampleOutput: dto.sampleOutput,
      languages: dto.languages,
      templates: dto.templates,
      wrappers: dto.wrappers,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đề bài coding (Admin)' })
  delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.deleteProblemUseCase.execute(req.user.id, id);
  }
}
