export interface CodingProblemDomain {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMs: number;
  memoryLimitMb: number;
  sampleInput: string | null;
  sampleOutput: string | null;
  languages: string[];
  templates: Record<string, string>;
  wrappers: Record<string, string>;
  status: 'draft' | 'public';
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}
