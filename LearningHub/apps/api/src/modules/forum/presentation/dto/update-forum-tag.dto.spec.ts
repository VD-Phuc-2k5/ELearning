import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateForumTagDto } from './update-forum-tag.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(UpdateForumTagDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('UpdateForumTagDto validation', () => {
  it('should pass with no fields (all optional)', async () => {
    const errors = await getErrors({});
    expect(errors).toHaveLength(0);
  });

  it('should pass with a valid partial update', async () => {
    const errors = await getErrors({ name: 'typescript', color: '#123ABC' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is empty string', async () => {
    const errors = await getErrors({ name: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid hex color format', async () => {
    const errors = await getErrors({ color: '123456' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
