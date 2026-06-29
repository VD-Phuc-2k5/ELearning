import { RoadmapItemDomain } from '../entities/roadmap-item.domain';

export interface BankRoadmapItem {
  roadmapId: string;
  roadmapTitle: string;
  position: number;
}

export interface IRoadmapItemRepository {
  setItems(roadmapId: string, bankIds: string[]): Promise<RoadmapItemDomain[]>;
  findByRoadmapId(roadmapId: string): Promise<RoadmapItemDomain[]>;
  findBankRoadmaps(bankId: string): Promise<BankRoadmapItem[]>;
  removeItem(roadmapId: string, bankId: string): Promise<void>;
  countItems(roadmapId: string): Promise<number>;
}

export const ROADMAP_ITEM_REPOSITORY = Symbol('IRoadmapItemRepository');
