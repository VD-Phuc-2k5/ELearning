import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PollDto } from './poll.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(PollDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('PollDto validation', () => {
  const valid = {
    question: 'Best language?',
    options: [{ text: 'TS' }, { text: 'Go' }],
  };

  it('should pass with valid question and options', async () => {
    const errors = await getErrors(valid);
    expect(errors).toHaveLength(0);
  });

  it('should fail when question is missing', async () => {
    const { question: _question, ...rest } = valid;
    const errors = await getErrors(rest);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when options is not an array', async () => {
    const errors = await getErrors({ question: 'Q?', options: 'not-an-array' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid endsAt date string', async () => {
    const errors = await getErrors({ ...valid, endsAt: 'not-a-date' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with a valid endsAt date string', async () => {
    const errors = await getErrors({
      ...valid,
      endsAt: '2026-12-31T00:00:00.000Z',
    });
    expect(errors).toHaveLength(0);
  });
});
