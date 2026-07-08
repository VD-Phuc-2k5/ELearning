import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ToggleReactionDto } from './forum-interaction.request.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(ToggleReactionDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('ToggleReactionDto validation', () => {
  it('should pass with a valid emoji', async () => {
    const errors = await getErrors({ emoji: '👍' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when emoji is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when emoji is not a string', async () => {
    const errors = await getErrors({ emoji: 123 });
    expect(errors.length).toBeGreaterThan(0);
  });
});
