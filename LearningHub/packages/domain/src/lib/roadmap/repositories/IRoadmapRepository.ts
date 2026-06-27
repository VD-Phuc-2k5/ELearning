import { Either, Failure } from '@learning-hub/core';
import { Roadmap } from '../entities/Roadmap';
import { RoadmapItem } from '../entities/RoadmapItem';
import { UserRoadmapProgress } from '../entities/UserRoadmapProgress';
import { RoadmapDetail } from '../entities/RoadmapDetail';

export interface GetRoadmapsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateRoadmapParams {
  title: string;
  description?: string;
}

export interface UpdateRoadmapParams {
  title?: string;
  description?: string;
  status?: string;
}

export interface RoadmapList {
  readonly data: Roadmap[];
  readonly total: number;
}

export interface IRoadmapRepository {
  getRoadmaps(params: GetRoadmapsParams): Promise<Either<Failure, RoadmapList>>;
  createRoadmap(params: CreateRoadmapParams): Promise<Either<Failure, Roadmap>>;
  getRoadmapDetail(id: string): Promise<Either<Failure, RoadmapDetail>>;
  updateRoadmap(
    id: string,
    params: UpdateRoadmapParams,
  ): Promise<Either<Failure, Roadmap>>;
  deleteRoadmap(id: string): Promise<Either<Failure, void>>;
  setRoadmapItems(
    id: string,
    bankIds: string[],
  ): Promise<Either<Failure, RoadmapItem[]>>;
  enrollRoadmap(id: string): Promise<Either<Failure, UserRoadmapProgress>>;
  getMyRoadmapProgress(): Promise<Either<Failure, UserRoadmapProgress[]>>;
}
