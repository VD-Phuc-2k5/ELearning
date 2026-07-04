import { TestCaseDomain } from '../entities/test-case.domain';

export const TEST_CASE_REPOSITORY = 'ITestCaseRepository';

export interface ITestCaseRepository {
  create(
    testCase: Omit<TestCaseDomain, 'id' | 'createdAt'>,
  ): Promise<TestCaseDomain>;
  update(
    id: string,
    testCase: Partial<Omit<TestCaseDomain, 'id' | 'problemId' | 'createdAt'>>,
  ): Promise<TestCaseDomain>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TestCaseDomain | null>;
  findByProblemId(problemId: string): Promise<TestCaseDomain[]>;
}
