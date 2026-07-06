import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { CodingProblemDomain } from '../../domain/entities/coding-problem.domain';

@Injectable()
export class ListProblemsUseCase {
  constructor(
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
  ) {}

  async execute(options?: {
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CodingProblemDomain[]; total: number }> {
    return this.problemRepo.findAll(options);
  }

  async getById(id: string): Promise<CodingProblemDomain> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) throw new NotFoundException('Coding problem not found');
    return problem;
  }
}
