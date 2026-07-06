import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AuthModule } from './modules/auth/auth.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { ForumModule } from './modules/forum/forum.module';
import { CreateAuthTables1781948713338 } from './migrations/1781948713338-CreateAuthTables';
import { CreateRbacTables1781966917253 } from './migrations/1781966917253-CreateRbacTables';
import { SeedAuthData1781966917254 } from './migrations/1781966917254-SeedAuthData';
import { AddPermissionResourceAction1781966917255 } from './migrations/1781966917255-AddPermissionResourceAction';
import { SeedAdminUser1781966917256 } from './migrations/1781966917256-SeedAdminUser';
import { FixAdminToOwner1781966917257 } from './migrations/1781966917257-FixAdminToOwner';
import { CreateQuizTables1782371681448 } from './migrations/1782371681448-CreateQuizTables';
import { AddFileMetadataToQuestionBankUploads1782377082025 } from './migrations/1782377082025-AddFileMetadataToQuestionBankUploads';
import { SeedQuizPermissionsForStudent1782430000000 } from './migrations/1782430000000-SeedQuizPermissionsForStudent';
import { AssignStudentRoleOnRegister1782500000000 } from './migrations/1782500000000-AssignStudentRoleOnRegister';
import { AddCascadeDeleteToQuizEntities1782610330302 } from './migrations/1782610330302-AddCascadeDeleteToQuizEntities';
import { AddBankFkSetNullOnProgress1782610512970 } from './migrations/1782610512970-AddBankFkSetNullOnProgress';
import { AddCascadeDeleteToRoadmapItem1782610764877 } from './migrations/1782610764877-AddCascadeDeleteToRoadmapItem';
import { AddRemainingCascadeDeletes1782611068704 } from './migrations/1782611068704-AddRemainingCascadeDeletes';
import { AddTimestampsToQuestions1782836007311 } from './migrations/1782836007311-AddTimestampsToQuestions';
import { CreateRoadmapTables1783000000001 } from './migrations/1783000000001-CreateRoadmapTables';
import { CreateQuizAttemptTables1783000000002 } from './migrations/1783000000002-CreateQuizAttemptTables';
import { CreateUserProgressTables1783000000003 } from './migrations/1783000000003-CreateUserProgressTables';
import { AddPassingScoreToBank1783000000004 } from './migrations/1783000000004-AddPassingScoreToBank';
import { SeedRoadmapPermissions1783000000005 } from './migrations/1783000000005-SeedRoadmapPermissions';
import { UpdateQuizAttemptsBankFkCascade1783000000006 } from './migrations/1783000000006-UpdateQuizAttemptsBankFkCascade';
import { FixQuizAttemptAnswerOptionFk1783000000007 } from './migrations/1783000000007-FixQuizAttemptAnswerOptionFk';
import { CascadeAllQuestionFks1783000000011 } from './migrations/1783000000011-CascadeAllQuestionFks';
import { CreateForumTables1784000000001 } from './migrations/1784000000001-CreateForumTables';
import { SeedForumPermissions1784000000002 } from './migrations/1784000000002-SeedForumPermissions';
import { CascadeAllQuestionBankFks1784000000003 } from './migrations/1784000000003-CascadeAllQuestionBankFks';
import { AddForumPostTags1784000000004 } from './migrations/1784000000004-AddForumPostTags';
import { AddAcceptedCountToForumInvites1784000000005 } from './migrations/1784000000005-AddAcceptedCountToForumInvites';
import { AddForumUpdateDeletePermissions1784000000006 } from './migrations/1784000000006-AddForumUpdateDeletePermissions';
import { AddAdminModerationPermissions1784000000007 } from './migrations/1784000000007-AddAdminModerationPermissions';
import { AddQuizBankReviewStatuses1784000000008 } from './migrations/1784000000008-AddQuizBankReviewStatuses';
import { AddTagCreatedBy1784000000009 } from './migrations/1784000000009-AddTagCreatedBy';
import { AddUniqueUsername1785000000001 } from './migrations/1785000000001-AddUniqueUsername';
import { AddRejectReasonToQuestionBanks1785000000002 } from './migrations/1785000000002-AddRejectReasonToQuestionBanks';
import { DropBrokenForumPostSearchTrigger1785000000003 } from './migrations/1785000000003-DropBrokenForumPostSearchTrigger';
import { SandboxModule } from './modules/sandbox/sandbox.module';
import { JudgeModule } from './modules/judge/judge.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [
          CreateAuthTables1781948713338,
          CreateRbacTables1781966917253,
          SeedAuthData1781966917254,
          AddPermissionResourceAction1781966917255,
          SeedAdminUser1781966917256,
          FixAdminToOwner1781966917257,
          CreateQuizTables1782371681448,
          AddFileMetadataToQuestionBankUploads1782377082025,
          SeedQuizPermissionsForStudent1782430000000,
          AssignStudentRoleOnRegister1782500000000,
          AddCascadeDeleteToQuizEntities1782610330302,
          AddBankFkSetNullOnProgress1782610512970,
          AddCascadeDeleteToRoadmapItem1782610764877,
          AddRemainingCascadeDeletes1782611068704,
          AddTimestampsToQuestions1782836007311,
          CreateRoadmapTables1783000000001,
          CreateQuizAttemptTables1783000000002,
          CreateUserProgressTables1783000000003,
          AddPassingScoreToBank1783000000004,
          SeedRoadmapPermissions1783000000005,
          UpdateQuizAttemptsBankFkCascade1783000000006,
          FixQuizAttemptAnswerOptionFk1783000000007,
          CascadeAllQuestionFks1783000000011,
          CreateForumTables1784000000001,
          SeedForumPermissions1784000000002,
          CascadeAllQuestionBankFks1784000000003,
          AddForumPostTags1784000000004,
          AddAcceptedCountToForumInvites1784000000005,
          AddForumUpdateDeletePermissions1784000000006,
          AddAdminModerationPermissions1784000000007,
          AddQuizBankReviewStatuses1784000000008,
          AddTagCreatedBy1784000000009,
          AddUniqueUsername1785000000001,
          AddRejectReasonToQuestionBanks1785000000002,
          DropBrokenForumPostSearchTrigger1785000000003,
        ],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
        }),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    QuizModule,
    RoadmapModule,
    ForumModule,
    SandboxModule,
    JudgeModule,
  ],
  controllers: [],
  providers: [],
})
// Trigger watcher rebuild
export class AppModule {}
