import { Injectable, Logger } from '@nestjs/common';
import { ISandboxService } from '../../application/interfaces/i-sandbox.service';
import { ExecutionResult } from '../../domain/entities/execution-result';
import { SUPPORTED_LANGUAGES } from '../../domain/entities/supported-language';
import * as Docker from 'dockerode';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const DockerodeConstructor = require('dockerode');

@Injectable()
export class DockerSandboxService implements ISandboxService {
  private readonly logger = new Logger(DockerSandboxService.name);
  private readonly docker: Docker = new DockerodeConstructor();

  async execute(params: {
    language: string;
    sourceCode: string;
    stdin?: string;
    timeoutMs?: number;
    memoryLimitMb?: number;
  }): Promise<ExecutionResult> {
    const language = params.language as keyof typeof SUPPORTED_LANGUAGES;
    const langConfig = SUPPORTED_LANGUAGES[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${params.language}`);
    }

    const timeoutMs = params.timeoutMs || 10000;
    const memoryLimitMb = params.memoryLimitMb || 64;

    // 1. Create a unique temporary directory
    const tempDir = mkdtempSync(join(tmpdir(), 'sandbox-'));
    const codeFileName =
      language === 'java' ? 'Main.java' : `main${langConfig.fileExt}`;
    writeFileSync(join(tempDir, codeFileName), params.sourceCode);

    const hasStdin = params.stdin !== undefined && params.stdin !== '';
    if (hasStdin) {
      writeFileSync(join(tempDir, 'input.txt'), params.stdin!);
    }

    // 2. Build execution command inside shell
    let runCmd = '';
    if (language === 'python') {
      runCmd = hasStdin ? 'python3 main.py < input.txt' : 'python3 main.py';
    } else if (language === 'javascript') {
      runCmd = hasStdin ? 'node main.js < input.txt' : 'node main.js';
    } else if (language === 'c') {
      runCmd = hasStdin
        ? 'gcc main.c -o /tmp/main.out && /tmp/main.out < input.txt'
        : 'gcc main.c -o /tmp/main.out && /tmp/main.out';
    } else if (language === 'java') {
      runCmd = hasStdin
        ? 'javac Main.java -d /tmp && java -cp /tmp Main < input.txt'
        : 'javac Main.java -d /tmp && java -cp /tmp Main';
    } else if (language === 'go') {
      runCmd = hasStdin
        ? 'mkdir -p /tmp/go-cache /tmp/go-path && GOCACHE=/tmp/go-cache GOPATH=/tmp/go-path GO111MODULE=off go build -o /tmp/main main.go && /tmp/main < input.txt'
        : 'mkdir -p /tmp/go-cache /tmp/go-path && GOCACHE=/tmp/go-cache GOPATH=/tmp/go-path GO111MODULE=off go build -o /tmp/main main.go && /tmp/main';
    } else if (language === 'csharp') {
      runCmd = hasStdin
        ? 'cp -r /home/sandbox/project /tmp/project && cp main.cs /tmp/project/Program.cs && dotnet run --project /tmp/project --no-restore -q < input.txt'
        : 'cp -r /home/sandbox/project /tmp/project && cp main.cs /tmp/project/Program.cs && dotnet run --project /tmp/project --no-restore -q';
    } else if (language === 'cpp') {
      runCmd = hasStdin
        ? 'g++ main.cpp -o /tmp/main.out && /tmp/main.out < input.txt'
        : 'g++ main.cpp -o /tmp/main.out && /tmp/main.out';
    } else if (language === 'rust') {
      runCmd = hasStdin
        ? 'rustc main.rs -o /tmp/main.out && /tmp/main.out < input.txt'
        : 'rustc main.rs -o /tmp/main.out && /tmp/main.out';
    } else if (language === 'typescript') {
      runCmd = hasStdin
        ? 'deno run --no-remote main.ts < input.txt'
        : 'deno run --no-remote main.ts';
    } else if (language === 'swift') {
      runCmd = hasStdin
        ? 'swift -module-cache-path /tmp/swift-cache main.swift < input.txt'
        : 'swift -module-cache-path /tmp/swift-cache main.swift';
    }

    let container: Docker.Container | null = null;
    const startTime = Date.now();
    let status: 'success' | 'error' | 'timeout' | 'memory_limit' = 'success';
    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;
    let oomKilled = false;

    try {
      // 3. Create Docker container with resource constraints
      container = await this.docker.createContainer({
        Image: langConfig.image,
        Cmd: ['sh', '-c', runCmd],
        HostConfig: {
          Memory: memoryLimitMb * 1024 * 1024, // RAM Limit
          MemorySwap: memoryLimitMb * 1024 * 1024, // Disable swap
          NanoCpus: 0.5 * 1e9, // 0.5 CPU core
          NetworkMode: 'none', // No internet access
          ReadonlyRootfs: true, // Read-only root filesystem
          Binds: [`${tempDir.replace(/\\/g, '/')}:/sandbox:ro`], // Mount code dir as Read-Only
          Tmpfs: { '/tmp': 'rw,exec,size=128m' }, // Small rw tmpfs for compilation output execution
          PidsLimit: 200, // Prevent fork bombs, increased for compilers like Go/Rust
          SecurityOpt: ['no-new-privileges'],
        },
        WorkingDir: '/sandbox',
        StopTimeout: 1,
      });

      // 4. Start container
      await container.start();

      // 5. Race container completion with timeout limit
      let timeoutTimer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          reject(new Error('timeout'));
        }, timeoutMs);
      });

      try {
        await Promise.race([container.wait(), timeoutPromise]);
      } catch (err: any) {
        if (err.message === 'timeout') {
          status = 'timeout';
          try {
            if (container) {
              await container.kill();
            }
          } catch (killErr) {
            this.logger.error(
              'Failed to kill container after timeout:',
              killErr,
            );
          }
        } else {
          throw err;
        }
      } finally {
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
        }
      }

      const executionTimeMs = Date.now() - startTime;

      // 6. Gather container logs and inspect details
      if (container) {
        const inspectInfo = await container.inspect();
        exitCode = inspectInfo.State.ExitCode;
        oomKilled = inspectInfo.State.OOMKilled;

        if (oomKilled) {
          status = 'memory_limit';
          stderr = 'Error: Memory limit exceeded.';
        } else if (status !== 'timeout') {
          const logsBuffer = await container.logs({
            stdout: true,
            stderr: true,
          });
          const parsedLogs = this.parseDockerStream(logsBuffer);
          stdout = parsedLogs.stdout;
          stderr = parsedLogs.stderr;

          if (exitCode !== 0) {
            status = 'error';
          }
        }
      }

      return {
        status,
        stdout,
        stderr,
        exitCode,
        executionTimeMs,
        memoryUsedBytes: oomKilled ? memoryLimitMb * 1024 * 1024 : null,
      };
    } catch (err: any) {
      this.logger.error('Sandbox execution error:', err);
      return {
        status: 'error',
        stdout: '',
        stderr: err.message || 'Execution failed due to server error.',
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        memoryUsedBytes: null,
      };
    } finally {
      // 7. Cleanup Docker container and temporary directory
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (removeErr) {
          this.logger.error('Failed to remove container:', removeErr);
        }
      }
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (rmErr) {
        this.logger.error('Failed to remove temp dir:', rmErr);
      }
    }
  }

  /**
   * Helper to parse Docker logs multiplexed stream
   */
  private parseDockerStream(buffer: Buffer): {
    stdout: string;
    stderr: string;
  } {
    let stdout = '';
    let stderr = '';
    let offset = 0;

    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) break;
      const type = buffer.readUInt8(offset);
      const size = buffer.readUInt32BE(offset + 4);
      offset += 8;

      if (offset + size > buffer.length) break;
      const content = buffer.toString('utf8', offset, offset + size);
      offset += size;

      if (type === 1) {
        stdout += content;
      } else if (type === 2) {
        stderr += content;
      }
    }

    return { stdout, stderr };
  }
}
