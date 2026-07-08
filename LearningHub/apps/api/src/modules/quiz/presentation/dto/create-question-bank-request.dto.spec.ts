import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateQuestionBankRequestDto } from './create-question-bank-request.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateQuestionBankRequestDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateQuestionBankRequestDto validation', () => {
  it('TC026 — should pass with valid title and description', async () => {
    const errors = await getErrors({ title: 'Test Bank', description: 'desc' });
    expect(errors).toHaveLength(0);
  });

  it('TC027 — should fail when title is empty string', async () => {
    const errors = await getErrors({ title: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC028 — should fail when title is 2 characters (min - 1)', async () => {
    const errors = await getErrors({ title: 'ab' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC029 — should pass when title is 3 characters (min)', async () => {
    const errors = await getErrors({ title: 'abc' });
    expect(errors).toHaveLength(0);
  });

  it('TC030 — should fail when tagIds contains non-numeric values', async () => {
    const errors = await getErrors({
      title: 'Valid Title',
      tagIds: ['not-a-number'],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC029b — should pass with valid numeric tagIds', async () => {
    const errors = await getErrors({ title: 'Valid Title', tagIds: [1, 2] });
    expect(errors).toHaveLength(0);
  });
});
