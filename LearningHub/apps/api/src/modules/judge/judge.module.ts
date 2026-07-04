import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CodingProblemEntity } from './infrastructure/persistence/entities/coding-problem.entity';
import { TestCaseEntity } from './infrastructure/persistence/entities/test-case.entity';
import { SubmissionEntity } from './infrastructure/persistence/entities/submission.entity';
import { SubmissionResultEntity } from './infrastructure/persistence/entities/submission-result.entity';
import { CodingProblemController } from './presentation/controllers/coding-problem.controller';
import { SubmissionController } from './presentation/controllers/submission.controller';
import { CodingProblemRepository } from './infrastructure/persistence/repositories/coding-problem.repository';
import { TestCaseRepository } from './infrastructure/persistence/repositories/test-case.repository';
import { SubmissionRepository } from './infrastructure/persistence/repositories/submission.repository';
import { CreateProblemUseCase } from './application/use-cases/create-problem.use-case';
import { ManageTestCasesUseCase } from './application/use-cases/manage-test-cases.use-case';
import { SubmitCodeUseCase } from './application/use-cases/submit-code.use-case';
import { GetSubmissionUseCase } from './application/use-cases/get-submission.use-case';
import { ListProblemsUseCase } from './application/use-cases/list-problems.use-case';
import { UpdateProblemUseCase } from './application/use-cases/update-problem.use-case';
import { DeleteProblemUseCase } from './application/use-cases/delete-problem.use-case';
import { JudgeService } from './application/services/judge.service';
import { JudgeProcessor } from './infrastructure/queues/judge.processor';
import { JUDGE_QUEUE } from './infrastructure/queues/judge.queue';
import { SandboxModule } from '../sandbox/sandbox.module';
import { CODING_PROBLEM_REPOSITORY } from './domain/repositories/coding-problem.repository.interface';
import { TEST_CASE_REPOSITORY } from './domain/repositories/test-case.repository.interface';
import { SUBMISSION_REPOSITORY } from './domain/repositories/submission.repository.interface';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CodingProblemEntity,
      TestCaseEntity,
      SubmissionEntity,
      SubmissionResultEntity,
    ]),
    BullModule.registerQueue({
      name: JUDGE_QUEUE,
    }),
    SandboxModule,
    AuthModule,
  ],
  controllers: [CodingProblemController, SubmissionController],
  providers: [
    {
      provide: CODING_PROBLEM_REPOSITORY,
      useClass: CodingProblemRepository,
    },
    {
      provide: TEST_CASE_REPOSITORY,
      useClass: TestCaseRepository,
    },
    {
      provide: SUBMISSION_REPOSITORY,
      useClass: SubmissionRepository,
    },
    CreateProblemUseCase,
    ManageTestCasesUseCase,
    SubmitCodeUseCase,
    GetSubmissionUseCase,
    ListProblemsUseCase,
    UpdateProblemUseCase,
    DeleteProblemUseCase,
    JudgeService,
    JudgeProcessor,
  ],
  exports: [
    CreateProblemUseCase,
    ManageTestCasesUseCase,
    SubmitCodeUseCase,
    GetSubmissionUseCase,
    ListProblemsUseCase,
    UpdateProblemUseCase,
    DeleteProblemUseCase,
  ],
})
export class JudgeModule {}
