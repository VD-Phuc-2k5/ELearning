import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoadmapEntity } from './infrastructure/persistence/entities/roadmap.entity';
import { RoadmapItemEntity } from './infrastructure/persistence/entities/roadmap-item.entity';
import { UserRoadmapProgressEntity } from './infrastructure/persistence/entities/user-roadmap-progress.entity';

import { RoadmapRepository } from './infrastructure/persistence/repositories/roadmap.repository';
import { RoadmapItemRepository } from './infrastructure/persistence/repositories/roadmap-item.repository';
import { UserRoadmapProgressRepository } from './infrastructure/persistence/repositories/user-roadmap-progress.repository';

import { ROADMAP_REPOSITORY } from './domain/repositories/roadmap.repository.interface';
import { ROADMAP_ITEM_REPOSITORY } from './domain/repositories/roadmap-item.repository.interface';
import { USER_ROADMAP_PROGRESS_REPOSITORY } from './domain/repositories/user-roadmap-progress.repository.interface';

import { CreateRoadmapUseCase } from './application/use-cases/create-roadmap.use-case';
import { GetRoadmapListUseCase } from './application/use-cases/get-roadmap-list.use-case';
import { GetRoadmapDetailUseCase } from './application/use-cases/get-roadmap-detail.use-case';
import { UpdateRoadmapUseCase } from './application/use-cases/update-roadmap.use-case';
import { DeleteRoadmapUseCase } from './application/use-cases/delete-roadmap.use-case';
import { SetRoadmapItemsUseCase } from './application/use-cases/set-roadmap-items.use-case';
import { EnrollRoadmapUseCase } from './application/use-cases/enroll-roadmap.use-case';
import { GetMyRoadmapProgressUseCase } from './application/use-cases/get-my-roadmap-progress.use-case';

import { RoadmapController } from './presentation/controllers/roadmap.controller';
import { QuizModule } from '../quiz/quiz.module';

const entities = [RoadmapEntity, RoadmapItemEntity, UserRoadmapProgressEntity];

const repositoryProviders = [
  { provide: ROADMAP_REPOSITORY, useClass: RoadmapRepository },
  { provide: ROADMAP_ITEM_REPOSITORY, useClass: RoadmapItemRepository },
  {
    provide: USER_ROADMAP_PROGRESS_REPOSITORY,
    useClass: UserRoadmapProgressRepository,
  },
  RoadmapRepository,
  RoadmapItemRepository,
  UserRoadmapProgressRepository,
];

const useCases = [
  CreateRoadmapUseCase,
  GetRoadmapListUseCase,
  GetRoadmapDetailUseCase,
  UpdateRoadmapUseCase,
  DeleteRoadmapUseCase,
  SetRoadmapItemsUseCase,
  EnrollRoadmapUseCase,
  GetMyRoadmapProgressUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities), forwardRef(() => QuizModule)],
  controllers: [RoadmapController],
  providers: [...useCases, ...repositoryProviders],
  exports: [
    { provide: ROADMAP_ITEM_REPOSITORY, useClass: RoadmapItemRepository },
    {
      provide: USER_ROADMAP_PROGRESS_REPOSITORY,
      useClass: UserRoadmapProgressRepository,
    },
    RoadmapItemRepository,
    UserRoadmapProgressRepository,
  ],
})
export class RoadmapModule {}
