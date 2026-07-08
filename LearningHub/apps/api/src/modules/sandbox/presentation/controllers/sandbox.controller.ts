import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';
import { ExecuteCodeDto } from '../../application/dto/execute-code.dto';
import { ExecuteCodeUseCase } from '../../application/use-cases/execute-code.use-case';
import { GetExecutionHistoryUseCase } from '../../application/use-cases/get-execution-history.use-case';
import { ISandboxService } from '../../application/interfaces/i-sandbox.service';
import { ExecutionResult } from '../../domain/entities/execution-result';
import { CodeExecution } from '../../domain/entities/code-execution.domain';
import { SUPPORTED_LANGUAGES } from '../../domain/entities/supported-language';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@ApiTags('sandbox')
@ApiBearerAuth()
@Controller('sandbox')
export class SandboxController {
  constructor(
    @Inject('ISandboxService')
    private readonly sandboxService: ISandboxService,
    private readonly executeCodeUseCase: ExecuteCodeUseCase,
    private readonly getHistoryUseCase: GetExecutionHistoryUseCase,
  ) {}

  @Post('execute')
  async executeCode(
    @Body() dto: ExecuteCodeDto,
    @CurrentUser() user: User,
  ): Promise<ExecutionResult> {
    const result = await this.executeCodeUseCase.execute({
      dto,
      userId: user.id,
    });

    if (result.type === 'left') {
      throw new BadRequestException(result.value.message);
    }

    return result.value;
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ): Promise<CodeExecution[]> {
    const result = await this.getHistoryUseCase.execute({
      userId: user.id,
      limit: limit ? Number(limit) : undefined,
    });

    if (result.type === 'left') {
      throw new BadRequestException(result.value.message);
    }

    return result.value;
  }

  @Get('languages')
  @Public()
  async getSupportedLanguages() {
    return Object.keys(SUPPORTED_LANGUAGES);
  }

  @Get('health')
  @Public()
  async health() {
    const dockerOk = await this.sandboxService.ping();
    if (!dockerOk) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Docker sandbox is not available',
        docker: false,
      });
    }
    return { status: 'ok', docker: true };
  }
}
