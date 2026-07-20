import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateForumDto } from './update-forum.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(UpdateForumDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('UpdateForumDto validation', () => {
  it('should pass with no fields (all optional)', async () => {
    const errors = await getErrors({});
    expect(errors).toHaveLength(0);
  });

  it('should pass with a valid partial update', async () => {
    const errors = await getErrors({ name: 'Renamed Forum', isLocked: true });
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is too short', async () => {
    const errors = await getErrors({ name: 'ab' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid visibility value', async () => {
    const errors = await getErrors({ visibility: 'invalid' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when isLocked is not boolean', async () => {
    const errors = await getErrors({ isLocked: 'yes' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
