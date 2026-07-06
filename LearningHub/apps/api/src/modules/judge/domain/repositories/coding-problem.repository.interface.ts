import { CodingProblemDomain } from '../entities/coding-problem.domain';

export const CODING_PROBLEM_REPOSITORY = 'ICodingProblemRepository';

export interface ICodingProblemRepository {
  create(
    problem: Omit<CodingProblemDomain, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CodingProblemDomain>;
  update(
    id: string,
    problem: Partial<
      Omit<CodingProblemDomain, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<CodingProblemDomain>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<CodingProblemDomain | null>;
  findAll(options?: {
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CodingProblemDomain[]; total: number }>;
}
