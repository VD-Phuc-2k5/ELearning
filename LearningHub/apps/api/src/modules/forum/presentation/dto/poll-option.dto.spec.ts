import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PollOptionDto } from './poll-option.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(PollOptionDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('PollOptionDto validation', () => {
  it('should pass with valid text', async () => {
    const errors = await getErrors({ text: 'TypeScript' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when text is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when text is empty string', async () => {
    const errors = await getErrors({ text: '' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
