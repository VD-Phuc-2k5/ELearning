export interface RoadmapItemDomain {
  id: string;
  roadmapId: string;
  questionBankId: string;
  position: number;
  createdAt: Date;
  bankTitle?: string;
  bankTotalQuestions?: number;
  bankStatus?: string;
}
