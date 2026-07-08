import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreatePostDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreatePostDto validation', () => {
  it('should pass with just a title', async () => {
    const errors = await getErrors({ title: 'Hello World' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when title is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid roadmapId format', async () => {
    const errors = await getErrors({ title: 'Post', roadmapId: 'not-a-uuid' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with a valid poll', async () => {
    const errors = await getErrors({
      title: 'Poll Post',
      postType: 'poll',
      poll: {
        question: 'Best language?',
        options: [{ text: 'TS' }, { text: 'Go' }],
      },
    });
    expect(errors).toHaveLength(0);
  });
});
