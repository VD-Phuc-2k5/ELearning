import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateCommentDto } from './update-comment.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(UpdateCommentDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('UpdateCommentDto validation', () => {
  it('should pass with valid content', async () => {
    const errors = await getErrors({ content: 'Edited comment' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when content is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when content is empty string', async () => {
    const errors = await getErrors({ content: '' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
