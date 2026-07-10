export interface RoadmapDomain {
  id: string;
  title: string;
  description: string | null;
  creatorId: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
