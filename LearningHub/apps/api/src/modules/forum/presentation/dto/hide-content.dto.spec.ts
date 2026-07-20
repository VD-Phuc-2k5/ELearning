import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { HideContentDto } from './hide-content.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(HideContentDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('HideContentDto validation', () => {
  it('should pass with a valid reasonCode', async () => {
    const errors = await getErrors({ reasonCode: 'SPAM' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when reasonCode is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid reasonCode', async () => {
    const errors = await getErrors({ reasonCode: 'BECAUSE' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with optional reasonText', async () => {
    const errors = await getErrors({
      reasonCode: 'OTHER',
      reasonText: 'details',
    });
    expect(errors).toHaveLength(0);
  });
});
