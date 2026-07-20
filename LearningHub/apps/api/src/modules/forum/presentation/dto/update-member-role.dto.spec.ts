import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateMemberRoleDto } from './update-member-role.dto';

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(UpdateMemberRoleDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('UpdateMemberRoleDto validation', () => {
  it('should pass with a valid role', async () => {
    const errors = await getErrors({ role: 'moderator' });
    expect(errors).toHaveLength(0);
  });

  it('should fail when role is missing', async () => {
    const errors = await getErrors({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail for an invalid role value', async () => {
    const errors = await getErrors({ role: 'superadmin' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
