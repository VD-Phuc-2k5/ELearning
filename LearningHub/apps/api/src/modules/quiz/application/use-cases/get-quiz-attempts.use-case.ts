import { Inject, Injectable } from '@nestjs/common';
import {
  IQuizAttemptRepository,
  QUIZ_ATTEMPT_REPOSITORY,
} from '../../domain/repositories/quiz-attempt.repository.interface';

@Injectable()
export class GetQuizAttemptsUseCase {
  constructor(
    @Inject(QUIZ_ATTEMPT_REPOSITORY)
    private readonly repo: IQuizAttemptRepository,
  ) {}

  execute(
    userId: string,
    input: {
      page?: number;
      limit?: number;
      bankId?: string;
      uploaderId?: string;
    },
  ) {
    return this.repo.findByUser(userId, input);
  }
}
