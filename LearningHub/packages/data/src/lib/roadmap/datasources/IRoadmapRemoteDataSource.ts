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
  getRoadmaps(params: GetRoadmapsParams, token: string): Promise<RoadmapList>;
  createRoadmap(params: CreateRoadmapParams, token: string): Promise<Roadmap>;
  getRoadmapDetail(id: string, token: string): Promise<RoadmapDetail>;
  updateRoadmap(
    id: string,
    params: UpdateRoadmapParams,
    token: string,
  ): Promise<Roadmap>;
  deleteRoadmap(id: string, token: string): Promise<void>;
  setRoadmapItems(
    id: string,
    bankIds: string[],
    token: string,
  ): Promise<RoadmapItem[]>;
  enrollRoadmap(id: string, token: string): Promise<UserRoadmapProgress>;
  getMyRoadmapProgress(token: string): Promise<UserRoadmapProgress[]>;
}
