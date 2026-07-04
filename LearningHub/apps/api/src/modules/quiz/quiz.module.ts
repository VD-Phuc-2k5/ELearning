import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Entities
import { QuestionBankEntity } from './infrastructure/persistence/entities/question-bank.entity';
import { QuestionBankStatusEntity } from './infrastructure/persistence/entities/question-bank-status.entity';
import { QuestionBankUploadEntity } from './infrastructure/persistence/entities/question-bank-upload.entity';
import { BankTagEntity } from './infrastructure/persistence/entities/bank-tag.entity';
import { QuestionEntity } from './infrastructure/persistence/entities/question.entity';
import { AnswerOptionEntity } from './infrastructure/persistence/entities/answer-option.entity';
import { CorrectAnswerEntity } from './infrastructure/persistence/entities/correct-answer.entity';
import { QuizAttemptEntity } from './infrastructure/persistence/entities/quiz-attempt.entity';
import { QuizAttemptAnswerEntity } from './infrastructure/persistence/entities/quiz-attempt-answer.entity';
import { UserBankProgressEntity } from './infrastructure/persistence/entities/user-bank-progress.entity';

// Infrastructure - Repositories
import { QuestionBankRepository } from './infrastructure/persistence/repositories/question-bank.repository';
import { QuestionRepository } from './infrastructure/persistence/repositories/question.repository';
import { TagRepository } from './infrastructure/persistence/repositories/tag.repository';
import { UploadRepository } from './infrastructure/persistence/repositories/upload.repository';
import { QuizAttemptRepository } from './infrastructure/persistence/repositories/quiz-attempt.repository';
import { UserBankProgressRepository } from './infrastructure/persistence/repositories/user-bank-progress.repository';

// Infrastructure - Services
import { ExcelParserService } from './infrastructure/services/excel-parser.service';

// Domain - Repository tokens
import { QUESTION_BANK_REPOSITORY } from './domain/repositories/question-bank.repository.interface';
import { QUESTION_REPOSITORY } from './domain/repositories/question.repository.interface';
import { TAG_REPOSITORY } from './domain/repositories/tag.repository.interface';
import { UPLOAD_REPOSITORY } from './domain/repositories/upload.repository.interface';
import { QUIZ_ATTEMPT_REPOSITORY } from './domain/repositories/quiz-attempt.repository.interface';
import { USER_BANK_PROGRESS_REPOSITORY } from './domain/repositories/user-bank-progress.repository.interface';

// Application
import { EXCEL_PARSER_SERVICE } from './application/interfaces/i-excel-parser.service';
import { CreateQuestionBankUseCase } from './application/use-cases/create-question-bank.use-case';
import { GetQuestionBankListUseCase } from './application/use-cases/get-question-bank-list.use-case';
import { GetQuestionsForQuizUseCase } from './application/use-cases/get-questions-for-quiz.use-case';
import { VerifyQuestionAnswerUseCase } from './application/use-cases/verify-question-answer.use-case';
import { SubmitQuizUseCase } from './application/use-cases/submit-quiz.use-case';
import { GetQuestionBankDetailUseCase } from './application/use-cases/get-question-bank-detail.use-case';
import { UpdateQuestionBankUseCase } from './application/use-cases/update-question-bank.use-case';
import { DeleteQuestionBankUseCase } from './application/use-cases/delete-question-bank.use-case';
import { UpdateQuestionUseCase } from './application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from './application/use-cases/delete-question.use-case';
import { UploadExcelUseCase } from './application/use-cases/upload-excel.use-case';
import { GetUploadHistoryUseCase } from './application/use-cases/get-upload-history.use-case';
import { CheckBankHashUseCase } from './application/use-cases/check-bank-hash.use-case';
import { GetDerivedBanksUseCase } from './application/use-cases/get-derived-banks.use-case';
import { UploadQuestionsUseCase } from './application/use-cases/upload-questions.use-case';
import { ParseExcelUseCase } from './application/use-cases/parse-excel.use-case';
import { GetAllTagsUseCase } from './application/use-cases/get-all-tags.use-case';
import { CreateTagUseCase } from './application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from './application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from './application/use-cases/delete-tag.use-case';
import { GetQuizAttemptsUseCase } from './application/use-cases/get-quiz-attempts.use-case';
import { GetQuizAttemptDetailUseCase } from './application/use-cases/get-quiz-attempt-detail.use-case';
import { GetBankProgressUseCase } from './application/use-cases/get-bank-progress.use-case';
import { GetBankRoadmapsUseCase } from './application/use-cases/get-bank-roadmaps.use-case';
import { ApproveQuestionBankUseCase } from './application/use-cases/approve-question-bank.use-case';
import { RejectQuestionBankUseCase } from './application/use-cases/reject-question-bank.use-case';

import { MulterModule } from '@nestjs/platform-express';
import { QuizBankController } from './presentation/controllers/quiz-bank.controller';
import { QuizAttemptController } from './presentation/controllers/quiz-attempt.controller';
import { QuizTagController } from './presentation/controllers/quiz-tag.controller';
import { AdminQuizBankController } from './presentation/controllers/admin-quiz-bank.controller';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { UserRoleEntity } from '../auth/infrastructure/persistence/entities/user-role.entity';
import { UserEntity } from '../auth/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../auth/infrastructure/persistence/entities/role.entity';

const entities = [
  QuestionBankEntity,
  QuestionBankStatusEntity,
  QuestionBankUploadEntity,
  BankTagEntity,
  QuestionEntity,
  AnswerOptionEntity,
  CorrectAnswerEntity,
  QuizAttemptEntity,
  QuizAttemptAnswerEntity,
  UserBankProgressEntity,
  UserRoleEntity,
  UserEntity,
  RoleEntity,
];

const useCases = [
  CreateQuestionBankUseCase,
  GetQuestionBankListUseCase,
  GetQuestionsForQuizUseCase,
  VerifyQuestionAnswerUseCase,
  SubmitQuizUseCase,
  GetQuestionBankDetailUseCase,
  UpdateQuestionBankUseCase,
  DeleteQuestionBankUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  UploadExcelUseCase,
  GetUploadHistoryUseCase,
  CheckBankHashUseCase,
  GetDerivedBanksUseCase,
  UploadQuestionsUseCase,
  ParseExcelUseCase,
  GetAllTagsUseCase,
  CreateTagUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
  GetQuizAttemptsUseCase,
  GetQuizAttemptDetailUseCase,
  GetBankProgressUseCase,
  GetBankRoadmapsUseCase,
  ApproveQuestionBankUseCase,
  RejectQuestionBankUseCase,
];

const repositoryProviders = [
  { provide: QUESTION_BANK_REPOSITORY, useClass: QuestionBankRepository },
  { provide: QUESTION_REPOSITORY, useClass: QuestionRepository },
  { provide: TAG_REPOSITORY, useClass: TagRepository },
  { provide: UPLOAD_REPOSITORY, useClass: UploadRepository },
  { provide: QUIZ_ATTEMPT_REPOSITORY, useClass: QuizAttemptRepository },
  {
    provide: USER_BANK_PROGRESS_REPOSITORY,
    useClass: UserBankProgressRepository,
  },
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
    forwardRef(() => RoadmapModule),
  ],
  controllers: [
    QuizBankController,
    QuizAttemptController,
    QuizTagController,
    AdminQuizBankController,
  ],
  providers: [
    ...useCases,
    ...repositoryProviders,
    { provide: EXCEL_PARSER_SERVICE, useClass: ExcelParserService },
  ],
  exports: [
    {
      provide: USER_BANK_PROGRESS_REPOSITORY,
      useClass: UserBankProgressRepository,
    },
  ],
})
export class QuizModule {}
