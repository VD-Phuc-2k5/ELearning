import { Roadmap } from './Roadmap';
import { RoadmapItem } from './RoadmapItem';
import { UserRoadmapProgress } from './UserRoadmapProgress';

export interface RoadmapDetail {
  readonly roadmap: Roadmap;
  readonly items: RoadmapItem[];
  readonly userProgress: UserRoadmapProgress | null;
  readonly completedBankIds: string[];
}
