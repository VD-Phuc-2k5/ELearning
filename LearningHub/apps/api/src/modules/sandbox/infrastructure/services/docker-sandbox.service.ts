import { Injectable, Logger } from '@nestjs/common';
import { ISandboxService } from '../../application/interfaces/i-sandbox.service';
import { ExecutionResult } from '../../domain/entities/execution-result';
import { SUPPORTED_LANGUAGES } from '../../domain/entities/supported-language';
import * as Docker from 'dockerode';

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
    const codeB64 = Buffer.from(params.sourceCode, 'utf-8').toString('base64');

    const codePath = `/tmp/main${langConfig.fileExt}`;
    const stdinPath = '/tmp/input.txt';
    const hasStdin = params.stdin !== undefined && params.stdin !== '';

    // Write source code inside container via base64 decode
    let setup = `echo ${codeB64} | base64 -d > ${codePath} && `;

    if (hasStdin) {
      const stdinB64 = Buffer.from(params.stdin!, 'utf-8').toString('base64');
      setup += `echo ${stdinB64} | base64 -d > ${stdinPath} && `;
    }

    const stdinRedirect = hasStdin ? ` < ${stdinPath}` : '';
    let runCmd = '';

    if (language === 'python') {
      runCmd = `python3 ${codePath}${stdinRedirect}`;
    } else if (language === 'javascript') {
      runCmd = `node ${codePath}${stdinRedirect}`;
    } else if (language === 'c') {
      runCmd = `gcc ${codePath} -o /tmp/main.out && /tmp/main.out${stdinRedirect}`;
    } else if (language === 'java') {
      runCmd = `mv ${codePath} /tmp/Main.java && javac /tmp/Main.java -d /tmp && java -cp /tmp Main${stdinRedirect}`;
    } else if (language === 'go') {
      runCmd = `cp -r /home/sandbox/go-cache /tmp/go-cache && mkdir -p /tmp/go-path && GOCACHE=/tmp/go-cache GOPATH=/tmp/go-path GO111MODULE=off go build -o /tmp/main ${codePath} && /tmp/main${stdinRedirect}`;
    } else if (language === 'csharp') {
      runCmd = `cp -r /home/sandbox/project /tmp/project && cp ${codePath} /tmp/project/Program.cs && dotnet build --nologo --no-restore -c Release -o /tmp/out /tmp/project && dotnet /tmp/out/project.dll${stdinRedirect}`;
    } else if (language === 'cpp') {
      runCmd = `g++ ${codePath} -o /tmp/main.out && /tmp/main.out${stdinRedirect}`;
    } else if (language === 'rust') {
      runCmd = `rustc ${codePath} -o /tmp/main.out && /tmp/main.out${stdinRedirect}`;
    } else if (language === 'typescript') {
      runCmd = `deno run --no-remote ${codePath}${stdinRedirect}`;
    } else if (language === 'swift') {
      runCmd = `swift -module-cache-path /tmp/swift-cache ${codePath}${stdinRedirect}`;
    }

    runCmd = setup + runCmd;

    const compiledLangs = new Set([
      'go',
      'csharp',
      'c',
      'cpp',
      'java',
      'rust',
      'swift',
    ]);
    const isCompiled = compiledLangs.has(language);
    const nanoCpus = isCompiled ? 1.0 * 1e9 : 0.5 * 1e9;
    const tmpfsSize = isCompiled ? '512m' : '256m';

    let container: Docker.Container | null = null;
    const startTime = Date.now();
    let status: 'success' | 'error' | 'timeout' | 'memory_limit' = 'success';
    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;
    let oomKilled = false;

    try {
      container = await this.docker.createContainer({
        Image: langConfig.image,
        Cmd: ['sh', '-c', runCmd],
        Env: [
          'TMPDIR=/tmp',
          'DENO_DIR=/tmp/deno-cache',
          'DOTNET_CLI_HOME=/tmp',
          'DOTNET_NOLOGO=1',
          'DOTNET_CLI_TELEMETRY_OPTOUT=1',
          'DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1',
          'DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE=1',
        ],
        HostConfig: {
          Memory: memoryLimitMb * 1024 * 1024,
          MemorySwap: memoryLimitMb * 1024 * 1024,
          NanoCpus: nanoCpus,
          NetworkMode: 'none',
          ReadonlyRootfs: true,
          Tmpfs: { '/tmp': `rw,exec,size=${tmpfsSize}` },
          PidsLimit: 200,
          SecurityOpt: ['no-new-privileges'],
          CapDrop: ['ALL'],
        },
        WorkingDir: '/tmp',
        StopTimeout: 1,
      });

      await container.start();

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

          if (language === 'csharp') {
            stderr = stderr.replace(/^.*workload.*\n?/gm, '');
          }

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
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (removeErr) {
          this.logger.error('Failed to remove container:', removeErr);
        }
      }
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch (err) {
      this.logger.error('Docker ping failed:', err);
      return false;
    }
  }

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
