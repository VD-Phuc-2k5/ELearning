import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DismissReportDto } from './dismiss-report.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(DismissReportDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('DismissReportDto validation', () => {
  it('should pass with no fields (note optional)', async () => {
    const errors = await getErrors({});
    expect(errors).toHaveLength(0);
  });

  it('should pass with a valid note', async () => {
    const errors = await getErrors({ note: 'Not a violation' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when note is not a string', async () => {
    const errors = await getErrors({ note: 123 });
    expect(errors.length).toBeGreaterThan(0);
  });
});
