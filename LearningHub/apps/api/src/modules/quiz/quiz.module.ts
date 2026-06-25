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

// Application - Use Cases
import { CreateQuestionBankUseCase } from './application/use-cases/create-question-bank.use-case';
import { GetQuestionBankListUseCase } from './application/use-cases/get-question-bank-list.use-case';
import { GetQuestionsForQuizUseCase } from './application/use-cases/get-questions-for-quiz.use-case';
import { VerifyQuestionAnswerUseCase } from './application/use-cases/verify-question-answer.use-case';
import { SubmitQuizUseCase } from './application/use-cases/submit-quiz.use-case';

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
];

const repositoryProviders = [
  { provide: QUESTION_BANK_REPOSITORY, useClass: QuestionBankRepository },
  { provide: QUESTION_REPOSITORY, useClass: QuestionRepository },
  { provide: TAG_REPOSITORY, useClass: TagRepository },
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [QuizBankController, QuizTagController],
  providers: [
    ...useCases,
    ...repositoryProviders,
    // Concrete classes cần thiết cho DI của TypeORM
    QuestionBankRepository,
    QuestionRepository,
    TagRepository,
  ],
})
export class QuizModule {}
