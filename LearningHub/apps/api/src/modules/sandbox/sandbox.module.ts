import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeExecutionEntity } from './infrastructure/persistence/entities/code-execution.entity';
import { CodeExecutionRepository } from './infrastructure/persistence/repositories/code-execution.repository';
import { DockerSandboxService } from './infrastructure/services/docker-sandbox.service';
import { ExecuteCodeUseCase } from './application/use-cases/execute-code.use-case';
import { GetExecutionHistoryUseCase } from './application/use-cases/get-execution-history.use-case';
import { SandboxController } from './presentation/controllers/sandbox.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CodeExecutionEntity])],
  controllers: [SandboxController],
  providers: [
    {
      provide: 'ICodeExecutionRepository',
      useClass: CodeExecutionRepository,
    },
    {
      provide: 'ISandboxService',
      useClass: DockerSandboxService,
    },
    ExecuteCodeUseCase,
    GetExecutionHistoryUseCase,
  ],
  exports: [ExecuteCodeUseCase, GetExecutionHistoryUseCase],
})
export class SandboxModule {}
