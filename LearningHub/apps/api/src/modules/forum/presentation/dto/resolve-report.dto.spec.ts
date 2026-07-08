import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ResolveReportDto } from './resolve-report.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(ResolveReportDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('ResolveReportDto validation', () => {
  it('should pass with a valid resolutionNote', async () => {
    const errors = await getErrors({
      resolutionNote: 'Handled and removed content',
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail when resolutionNote is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when resolutionNote is empty string', async () => {
    const errors = await getErrors({ resolutionNote: '' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
