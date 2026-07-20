import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRoadmapDto } from './create-roadmap.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateRoadmapDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateRoadmapDto validation (TC044–TC045)', () => {
  it('TC044 — should pass with valid title', async () => {
    const errors = await getErrors({
      title: 'My Roadmap',
      description: 'A learning path',
    });
    expect(errors).toHaveLength(0);
  });

  it('TC045 — should fail when title is empty string', async () => {
    const errors = await getErrors({ title: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC045b — should fail when title is 2 characters (min - 1)', async () => {
    const errors = await getErrors({ title: 'ab' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass when title is exactly 3 characters (min)', async () => {
    const errors = await getErrors({ title: 'abc' });
    expect(errors).toHaveLength(0);
  });

  it('should pass without description (optional field)', async () => {
    const errors = await getErrors({ title: 'Valid Roadmap' });
    expect(errors).toHaveLength(0);
  });
});
