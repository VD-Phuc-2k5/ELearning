export interface RoadmapItem {
  readonly id: string;
  readonly roadmapId: string;
  readonly questionBankId: string;
  readonly position: number;
  readonly bankTitle?: string;
  readonly bankTotalQuestions?: number;
  readonly bankStatus?: string;
}
