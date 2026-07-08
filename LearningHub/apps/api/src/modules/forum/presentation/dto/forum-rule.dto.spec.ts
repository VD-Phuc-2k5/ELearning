import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ForumRuleDto } from './forum-rule.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(ForumRuleDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('ForumRuleDto validation', () => {
  it('should pass with valid title and body', async () => {
    const errors = await getErrors({
      title: 'Be respectful',
      body: 'No harassment',
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail when title is missing', async () => {
    const errors = await getErrors({ body: 'No harassment' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when body is missing', async () => {
    const errors = await getErrors({ title: 'Be respectful' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
