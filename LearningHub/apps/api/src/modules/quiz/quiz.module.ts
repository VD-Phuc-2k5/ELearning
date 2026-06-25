import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Entities
import { QuestionBankEntity } from './infrastructure/persistence/entities/question-bank.entity';
import { QuestionBankStatusEntity } from './infrastructure/persistence/entities/question-bank-status.entity';
import { QuestionBankUploadEntity } from './infrastructure/persistence/entities/question-bank-upload.entity';
import { BankTagEntity } from './infrastructure/persistence/entities/bank-tag.entity';
import { QuestionEntity } from './infrastructure/persistence/entities/question.entity';
import { AnswerOptionEntity } from './infrastructure/persistence/entities/answer-option.entity';
import { CorrectAnswerEntity } from './infrastructure/persistence/entities/correct-answer.entity';
import { QuestionDifficultEntity } from './infrastructure/persistence/entities/question-difficult.entity';

// Infrastructure - Repositories (implementations)
import { QuestionBankRepository } from './infrastructure/persistence/repositories/question-bank.repository';
import { QuestionRepository } from './infrastructure/persistence/repositories/question.repository';
import { TagRepository } from './infrastructure/persistence/repositories/tag.repository';

// Domain - Repository tokens
import { QUESTION_BANK_REPOSITORY } from './domain/repositories/question-bank.repository.interface';
import { QUESTION_REPOSITORY } from './domain/repositories/question.repository.interface';
import { TAG_REPOSITORY } from './domain/repositories/tag.repository.interface';
import { UPLOAD_REPOSITORY } from './domain/repositories/upload.repository.interface';

// Infrastructure - Services
import { ExcelParserService } from './infrastructure/services/excel-parser.service';
import { UploadRepository } from './infrastructure/persistence/repositories/upload.repository';

// Application - Use Cases
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

// Multer config
import { MulterModule } from '@nestjs/platform-express';

// Presentation - Controllers
import { QuizBankController } from './presentation/controllers/quiz-bank.controller';
import { QuizTagController } from './presentation/controllers/quiz-tag.controller';

const entities = [
  QuestionBankEntity,
  QuestionBankStatusEntity,
  QuestionBankUploadEntity,
  BankTagEntity,
  QuestionEntity,
  AnswerOptionEntity,
  CorrectAnswerEntity,
  QuestionDifficultEntity,
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
];

const repositoryProviders = [
  { provide: QUESTION_BANK_REPOSITORY, useClass: QuestionBankRepository },
  { provide: QUESTION_REPOSITORY, useClass: QuestionRepository },
  { provide: TAG_REPOSITORY, useClass: TagRepository },
  { provide: UPLOAD_REPOSITORY, useClass: UploadRepository },
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [QuizBankController, QuizTagController],
  providers: [
    ...useCases,
    ...repositoryProviders,
    ExcelParserService,
    // Concrete classes for TypeORM DI or usage if needed
    QuestionBankRepository,
    QuestionRepository,
    TagRepository,
    UploadRepository,
  ],
})
export class QuizModule {}

