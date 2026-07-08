import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from './create-comment.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateCommentDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateCommentDto validation', () => {
  it('should pass with just content', async () => {
    const errors = await getErrors({ content: 'Nice post!' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when content is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid parentId format', async () => {
    const errors = await getErrors({
      content: 'reply',
      parentId: 'not-a-uuid',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when mentionIds contains non-UUID entries', async () => {
    const errors = await getErrors({ content: 'hi @bob', mentionIds: ['bob'] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
