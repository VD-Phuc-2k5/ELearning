import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProblemDto } from './create-problem.dto';

function buildValid(overrides: Partial<Record<string, unknown>> = {}): object {
  return {
    title: 'Sum Two Numbers',
    description: 'Given a and b, return a+b',
    difficulty: 'easy',
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    languages: ['python'],
    ...overrides,
  };
}

async function getErrors(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateProblemDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateProblemDto validation', () => {
  it('TC055 — should pass with fully valid data', async () => {
    const errors = await getErrors(buildValid());
    expect(errors).toHaveLength(0);
  });

  it('TC056 — should fail with invalid difficulty value', async () => {
    const errors = await getErrors(buildValid({ difficulty: 'very-hard' }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC057 — should pass when title is exactly 200 characters (max)', async () => {
    const errors = await getErrors(buildValid({ title: 'a'.repeat(200) }));
    expect(errors).toHaveLength(0);
  });

  it('TC058 — should fail when title is 201 characters (max + 1)', async () => {
    const errors = await getErrors(buildValid({ title: 'a'.repeat(201) }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC059 — should fail when timeLimitMs is 99 (min - 1)', async () => {
    const errors = await getErrors(buildValid({ timeLimitMs: 99 }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC060 — should pass when timeLimitMs is 100 (min)', async () => {
    const errors = await getErrors(buildValid({ timeLimitMs: 100 }));
    expect(errors).toHaveLength(0);
  });

  it('TC061 — should fail when memoryLimitMb is 15 (min - 1)', async () => {
    const errors = await getErrors(buildValid({ memoryLimitMb: 15 }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC062 — should pass when memoryLimitMb is 16 (min)', async () => {
    const errors = await getErrors(buildValid({ memoryLimitMb: 16 }));
    expect(errors).toHaveLength(0);
  });

  it('TC063 — should fail with unsupported language', async () => {
    const errors = await getErrors(buildValid({ languages: ['brainfuck'] }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC064 — empty languages array passes DTO (no @ArrayMinSize; enforced in UI layer)', async () => {
    // ponytail: the DTO has no @ArrayMinSize — empty array is not rejected here.
    // Frontend CreateProblemModal.validateForm() blocks this case instead.
    const errors = await getErrors(buildValid({ languages: [] }));
    expect(errors).toHaveLength(0);
  });

  it('TC065 — should pass when description is exactly 10000 characters (max)', async () => {
    const errors = await getErrors(
      buildValid({ description: 'a'.repeat(10000) }),
    );
    expect(errors).toHaveLength(0);
  });

  it('TC066 — should fail when description is 10001 characters (max + 1)', async () => {
    const errors = await getErrors(
      buildValid({ description: 'a'.repeat(10001) }),
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('TC067 — should pass with all supported languages', async () => {
    const errors = await getErrors(
      buildValid({
        languages: [
          'python',
          'javascript',
          'typescript',
          'c',
          'cpp',
          'java',
          'go',
          'csharp',
          'rust',
          'swift',
        ],
      }),
    );
    expect(errors).toHaveLength(0);
  });
});
