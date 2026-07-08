import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SetForumRulesDto } from './set-forum-rules.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(SetForumRulesDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('SetForumRulesDto validation', () => {
  it('should pass with an empty rules array', async () => {
    const errors = await getErrors({ rules: [] });
    expect(errors).toHaveLength(0);
  });

  it('should pass with valid rules', async () => {
    const errors = await getErrors({
      rules: [{ title: 'Be respectful', body: 'No harassment' }],
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail when rules field is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when rules is not an array', async () => {
    const errors = await getErrors({ rules: 'not-an-array' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
