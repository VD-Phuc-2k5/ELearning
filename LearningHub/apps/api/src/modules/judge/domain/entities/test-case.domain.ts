export interface TestCaseDomain {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex: number;
  points: number;
  createdAt: Date;
}
