import {
  Body,
  Controller,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApproveQuestionBankUseCase } from '../../application/use-cases/approve-question-bank.use-case';
import { RejectQuestionBankUseCase } from '../../application/use-cases/reject-question-bank.use-case';

interface AuthenticatedRequest {
  user: { id: string };
}

@ApiTags('Admin - Kiểm duyệt ngân hàng câu hỏi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/quiz/banks')
export class AdminQuizBankController {
  constructor(
    private readonly approveQuestionBankUseCase: ApproveQuestionBankUseCase,
    private readonly rejectQuestionBankUseCase: RejectQuestionBankUseCase,
  ) {}

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Admin duyệt ngân hàng câu hỏi' })
  async approve(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.approveQuestionBankUseCase.execute(id, req.user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Admin từ chối ngân hàng câu hỏi' })
  async reject(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.rejectQuestionBankUseCase.execute(
      id,
      req.user.id,
      body?.reason,
    );
  }
}
