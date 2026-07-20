import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

function buildValid(overrides: Partial<Record<string, unknown>> = {}): object {
  return {
    email: 'test@gmail.com',
    password: 'Pass@1234',
    username: 'testuser',
    ...overrides,
  };
}

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(RegisterDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('RegisterDto validation', () => {
  describe('Happy path', () => {
    it('TC001 — should pass with valid data', async () => {
      const errors = await getErrors(buildValid());
      expect(errors).toHaveLength(0);
    });
  });

  describe('Email validation', () => {
    it('TC002 — should fail with invalid email format', async () => {
      const errors = await getErrors(buildValid({ email: 'notanemail' }));
      expect(errors.some((msg) => msg.toLowerCase().includes('email'))).toBe(
        true,
      );
    });
  });

  describe('Password validation', () => {
    it('TC005 — should fail when password has no uppercase letter', async () => {
      const errors = await getErrors(buildValid({ password: 'pass@1234' }));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('TC006 — should fail when password has no lowercase letter', async () => {
      const errors = await getErrors(buildValid({ password: 'PASS@1234' }));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('TC007 — should fail when password has no special character', async () => {
      const errors = await getErrors(buildValid({ password: 'Password1' }));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('TC008 — should fail when password is 7 characters (min - 1)', async () => {
      const errors = await getErrors(buildValid({ password: 'Pas@123' }));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('TC009 — should pass when password is 8 characters (min)', async () => {
      const errors = await getErrors(buildValid({ password: 'Pass@123' }));
      expect(errors).toHaveLength(0);
    });
  });

  describe('Username validation', () => {
    it('TC010 — should fail when username is 2 characters (min - 1)', async () => {
      const errors = await getErrors(buildValid({ username: 'ab' }));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('TC011 — should pass when username is 3 characters (min)', async () => {
      const errors = await getErrors(buildValid({ username: 'abc' }));
      expect(errors).toHaveLength(0);
    });

    it('TC012 — should fail when username is whitespace-only', async () => {
      // Transform trims the value first, then Matches check catches it
      const errors = await getErrors(buildValid({ username: '   ' }));
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Empty body', () => {
    it('TC013 — should fail with multiple validation errors when body is empty', async () => {
      const errors = await getErrors({});
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
