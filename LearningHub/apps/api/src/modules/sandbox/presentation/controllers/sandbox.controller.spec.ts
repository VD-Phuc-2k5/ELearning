import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SandboxController } from './sandbox.controller';
import { ExecuteCodeUseCase } from '../../application/use-cases/execute-code.use-case';
import { GetExecutionHistoryUseCase } from '../../application/use-cases/get-execution-history.use-case';

// ponytail: replicate Either shape inline — no import needed
const right = (value: unknown) => ({ type: 'right' as const, value });
const left = (value: unknown) => ({ type: 'left' as const, value });

const mockUser = { id: 'user-1' } as any;
const mockFn = () => ({ execute: jest.fn() });
const mockSandboxService = () => ({ ping: jest.fn() });

describe('SandboxController (TC069–TC075)', () => {
  let controller: SandboxController;
  let executeUseCase: { execute: jest.Mock };
  let historyUseCase: { execute: jest.Mock };
  let sandboxService: { ping: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SandboxController],
      providers: [
        { provide: ExecuteCodeUseCase, useValue: mockFn() },
        { provide: GetExecutionHistoryUseCase, useValue: mockFn() },
        { provide: 'ISandboxService', useValue: mockSandboxService() },
      ],
    }).compile();

    controller = module.get<SandboxController>(SandboxController);
    executeUseCase = module.get(ExecuteCodeUseCase);
    historyUseCase = module.get(GetExecutionHistoryUseCase);
    sandboxService = module.get('ISandboxService');
  });

  describe('POST /sandbox/execute', () => {
    const validDto = { language: 'python', sourceCode: "print('hello')" };

    it('TC069 — should execute Python code and return stdout output', async () => {
      const executionResult = { stdout: 'hello\n', stderr: '', exitCode: 0 };
      executeUseCase.execute.mockResolvedValue(right(executionResult));

      const result = await controller.executeCode(validDto as any, mockUser);

      expect(result).toEqual(executionResult);
    });

    it('TC070 — should return error output without throwing when code has syntax error', async () => {
      const errorResult = {
        stdout: '',
        stderr: 'SyntaxError: invalid syntax',
        exitCode: 1,
      };
      executeUseCase.execute.mockResolvedValue(right(errorResult));

      const result = await controller.executeCode(
        { language: 'python', sourceCode: 'def foo(:' } as any,
        mockUser,
      );

      expect((result as any).stderr).toContain('SyntaxError');
    });

    it('TC071 — should throw BadRequestException for unsupported language (use case returns left)', async () => {
      executeUseCase.execute.mockResolvedValue(
        left({ message: 'Unsupported language: brainfuck' }),
      );

      await expect(
        controller.executeCode(
          { language: 'brainfuck', sourceCode: '+++' } as any,
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('TC072 — should pass stdin to use case when provided', async () => {
      const executionResult = { stdout: '42\n', stderr: '', exitCode: 0 };
      executeUseCase.execute.mockResolvedValue(right(executionResult));

      const dto = {
        language: 'python',
        sourceCode: 'print(input())',
        stdin: '42\n',
      };
      await controller.executeCode(dto as any, mockUser);

      expect(executeUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          dto: expect.objectContaining({ stdin: '42\n' }),
        }),
      );
    });
  });

  describe('GET /sandbox/history', () => {
    it('TC073 — should return execution history for authenticated user', async () => {
      const history = [{ id: 'exec-1', language: 'python', stdout: 'hello\n' }];
      historyUseCase.execute.mockResolvedValue(right(history));

      const result = await controller.getHistory(mockUser);

      expect(result).toEqual(history);
    });
  });

  describe('GET /sandbox/health', () => {
    it('TC074 — should return ok when Docker is reachable', async () => {
      sandboxService.ping.mockResolvedValue(true);

      const result = await controller.health();

      expect(result).toEqual({ status: 'ok', docker: true });
    });

    it('TC075 — should throw ServiceUnavailableException when Docker is unreachable', async () => {
      sandboxService.ping.mockResolvedValue(false);

      await expect(controller.health()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
