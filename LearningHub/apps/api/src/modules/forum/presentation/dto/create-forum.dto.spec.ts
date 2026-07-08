import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateForumDto } from './create-forum.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateForumDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateForumDto validation', () => {
  it('should pass with a valid name', async () => {
    const errors = await getErrors({ name: 'General Discussion' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is too short', async () => {
    const errors = await getErrors({ name: 'ab' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when name is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid visibility value', async () => {
    const errors = await getErrors({ name: 'General', visibility: 'secret' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with valid visibility value', async () => {
    const errors = await getErrors({ name: 'General', visibility: 'private' });
    expect(errors).toHaveLength(0);
  });
});
