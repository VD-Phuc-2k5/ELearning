import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateReportDto } from './create-report.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateReportDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateReportDto validation', () => {
  const valid = {
    targetType: 'post',
    targetId: '3b1e6f2a-4c3d-4b1a-9f0a-6d2e1c8a7b5d',
    reason: 'SPAM',
  };

  it('should pass with valid data', async () => {
    const errors = await getErrors(valid);
    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid targetType', async () => {
    const errors = await getErrors({ ...valid, targetType: 'user' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for non-UUID targetId', async () => {
    const errors = await getErrors({ ...valid, targetId: 'not-a-uuid' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid reason', async () => {
    const errors = await getErrors({ ...valid, reason: 'BECAUSE' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
