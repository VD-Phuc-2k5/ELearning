import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { VotePollDto } from './vote-poll.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(VotePollDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('VotePollDto validation', () => {
  it('should pass with a valid optionIds array', async () => {
    const errors = await getErrors({
      optionIds: ['3b1e6f2a-4c3d-4b1a-9f0a-6d2e1c8a7b5d'],
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail with an empty optionIds array', async () => {
    const errors = await getErrors({ optionIds: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when optionIds is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when optionIds contains non-UUID entries', async () => {
    const errors = await getErrors({ optionIds: ['not-a-uuid'] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
