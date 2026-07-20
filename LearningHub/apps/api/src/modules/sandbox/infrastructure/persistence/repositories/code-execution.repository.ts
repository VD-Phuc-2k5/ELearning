import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodeExecutionEntity } from '../entities/code-execution.entity';
import { CodeExecution } from '../../../domain/entities/code-execution.domain';
import { ICodeExecutionRepository } from '../../../domain/repositories/i-code-execution.repository';

@Injectable()
export class CodeExecutionRepository implements ICodeExecutionRepository {
  constructor(
    @InjectRepository(CodeExecutionEntity)
    private readonly repository: Repository<CodeExecutionEntity>,
  ) {}

  async save(execution: CodeExecution): Promise<CodeExecution> {
    const entity = new CodeExecutionEntity();
    entity.id = execution.id;
    entity.userId = execution.userId;
    entity.language = execution.language;
    entity.sourceCode = execution.sourceCode;
    entity.stdin = execution.stdin;
    entity.stdout = execution.stdout;
    entity.stderr = execution.stderr;
    entity.exitCode = execution.exitCode;
    entity.status = execution.status;
    entity.executionTimeMs = execution.executionTimeMs;
    entity.memoryUsedBytes = execution.memoryUsedBytes;
    entity.createdAt = execution.createdAt;

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findByUserId(userId: string, limit?: number): Promise<CodeExecution[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit || 50,
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  private toDomain(entity: CodeExecutionEntity): CodeExecution {
    return new CodeExecution(
      entity.id,
      entity.userId,
      entity.language,
      entity.sourceCode,
      entity.stdin,
      entity.stdout,
      entity.stderr,
      entity.exitCode,
      entity.status,
      entity.executionTimeMs,
      entity.memoryUsedBytes ? Number(entity.memoryUsedBytes) : null,
      entity.createdAt,
    );
  }
}
