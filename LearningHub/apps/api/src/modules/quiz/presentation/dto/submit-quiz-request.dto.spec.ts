import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SubmitQuizRequestDto } from './submit-quiz-request.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(SubmitQuizRequestDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('SubmitQuizRequestDto validation (TC039)', () => {
  it('TC039 — should fail when answers array is empty', async () => {
    const errors = await getErrors({ answers: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with one valid answer item', async () => {
    const errors = await getErrors({
      answers: [{ questionId: 'q-1', selectedOptionId: 'opt-1' }],
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail when answers field is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });
});
