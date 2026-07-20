import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdatePostDto } from './update-post.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(UpdatePostDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('UpdatePostDto validation', () => {
  it('should pass with no fields (all optional)', async () => {
    const errors = await getErrors({});
    expect(errors).toHaveLength(0);
  });

  it('should pass with a valid partial update', async () => {
    const errors = await getErrors({ title: 'Updated Title', tagIds: [1, 2] });
    expect(errors).toHaveLength(0);
  });

  it('should fail when tagIds contains non-integers', async () => {
    const errors = await getErrors({ tagIds: ['a', 'b'] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
