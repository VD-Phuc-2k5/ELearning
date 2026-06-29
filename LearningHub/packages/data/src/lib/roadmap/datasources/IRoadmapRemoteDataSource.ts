import {
  CreateRoadmapParams,
  GetRoadmapsParams,
  Roadmap,
  RoadmapDetail,
  RoadmapItem,
  RoadmapList,
  UpdateRoadmapParams,
  UserRoadmapProgress,
} from '@learning-hub/domain';

export interface IRoadmapRemoteDataSource {
  setToken(token: string): void;
  getRoadmaps(params: GetRoadmapsParams): Promise<RoadmapList>;
  getMyRoadmaps(params: GetRoadmapsParams): Promise<RoadmapList>;
  createRoadmap(params: CreateRoadmapParams): Promise<Roadmap>;
  getRoadmapDetail(id: string): Promise<RoadmapDetail>;
  updateRoadmap(id: string, params: UpdateRoadmapParams): Promise<Roadmap>;
  deleteRoadmap(id: string): Promise<void>;
  setRoadmapItems(id: string, bankIds: string[]): Promise<RoadmapItem[]>;
  enrollRoadmap(id: string): Promise<UserRoadmapProgress>;
  getMyRoadmapProgress(): Promise<UserRoadmapProgress[]>;
}
