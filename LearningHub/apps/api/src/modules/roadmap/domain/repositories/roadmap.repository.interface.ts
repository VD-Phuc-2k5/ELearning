import { RoadmapDomain } from '../entities/roadmap.domain';

export interface CreateRoadmapInput {
  title: string;
  description?: string;
  creatorId: string;
}

export interface GetRoadmapListInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  creatorId?: string;
}

export interface UpdateRoadmapInput {
  title?: string;
  description?: string;
  status?: string;
}

export interface RoadmapListPage {
  data: RoadmapDomain[];
  total: number;
}

export interface IRoadmapRepository {
  create(input: CreateRoadmapInput): Promise<RoadmapDomain>;
  findAll(input: GetRoadmapListInput): Promise<RoadmapListPage>;
  findById(id: string): Promise<RoadmapDomain | null>;
  update(id: string, input: UpdateRoadmapInput): Promise<RoadmapDomain>;
  delete(id: string): Promise<void>;
}

export const ROADMAP_REPOSITORY = Symbol('IRoadmapRepository');
