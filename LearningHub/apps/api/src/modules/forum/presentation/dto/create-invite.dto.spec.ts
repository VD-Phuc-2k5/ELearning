import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateInviteDto } from './create-invite.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateInviteDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateInviteDto validation', () => {
  it('should pass with no fields (inviteeId optional)', async () => {
    const errors = await getErrors({});
    expect(errors).toHaveLength(0);
  });

  it('should pass with a valid inviteeId', async () => {
    const errors = await getErrors({
      inviteeId: '3b1e6f2a-4c3d-4b1a-9f0a-6d2e1c8a7b5d',
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid inviteeId format', async () => {
    const errors = await getErrors({ inviteeId: 'not-a-uuid' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
