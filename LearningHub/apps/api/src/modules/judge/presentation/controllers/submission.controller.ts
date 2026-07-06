import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubmitCodeUseCase } from '../../application/use-cases/submit-code.use-case';
import { GetSubmissionUseCase } from '../../application/use-cases/get-submission.use-case';
import { SubmitCodeDto } from '../dto/submit-code.dto';
interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Code Submissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class SubmissionController {
  constructor(
    private readonly submitCodeUseCase: SubmitCodeUseCase,
    private readonly getSubmissionUseCase: GetSubmissionUseCase,
  ) {}

  @Post('problems/:id/submit')
  @ApiOperation({ summary: 'Nộp bài lập trình mới' })
  submit(
    @Request() req: AuthenticatedRequest,
    @Param('id') problemId: string,
    @Body() dto: SubmitCodeDto,
  ) {
    return this.submitCodeUseCase.execute(req.user.id, problemId, {
      language: dto.language,
      sourceCode: dto.sourceCode,
    });
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Xem chi tiết kết quả nộp bài' })
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.getSubmissionUseCase.execute(req.user.id, id);
  }
}
