import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateForumTagDto } from './create-forum-tag.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateForumTagDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateForumTagDto validation', () => {
  it('should pass with a valid name', async () => {
    const errors = await getErrors({ name: 'javascript' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is empty', async () => {
    const errors = await getErrors({ name: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with a valid hex color', async () => {
    const errors = await getErrors({ name: 'js', color: '#FF00AA' });
    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid hex color format', async () => {
    const errors = await getErrors({ name: 'js', color: 'red' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
