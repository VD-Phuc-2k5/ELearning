import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBankUploadEntity } from '../entities/question-bank-upload.entity';
import {
  IUploadRepository,
  CreateUploadLogInput,
} from '../../../domain/repositories/upload.repository.interface';
import { QuestionBankUploadDomain } from '../../../domain/entities/question-bank-upload.domain';

@Injectable()
export class UploadRepository implements IUploadRepository {
  constructor(
    @InjectRepository(QuestionBankUploadEntity)
    private readonly repo: Repository<QuestionBankUploadEntity>,
  ) {}

  private toDomain(entity: QuestionBankUploadEntity): QuestionBankUploadDomain {
    return {
      id: entity.id,
      questionBankId: entity.questionBankId,
      uploadedBy: entity.uploadedBy,
      uploadedAt: entity.uploadedAt,
      fileName: entity.fileName,
      totalQuestionsImported: entity.totalQuestionsImported,
      uploaderUsername: entity.uploader?.username,
    };
  }

  async findById(id: string): Promise<QuestionBankUploadDomain> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { uploader: true },
    });
    if (!entity) {
      throw new Error(`Không tìm thấy bản ghi upload với ID: ${id}`);
    }
    return this.toDomain(entity);
  }

  async create(input: CreateUploadLogInput): Promise<QuestionBankUploadDomain> {
    const entity = this.repo.create({
      questionBankId: input.questionBankId,
      uploadedBy: input.uploadedBy,
      fileName: input.fileName,
      totalQuestionsImported: input.totalQuestionsImported,
    });
    const saved = await this.repo.save(entity);
    return this.findById(saved.id);
  }

  async findByBankId(bankId: string): Promise<QuestionBankUploadDomain[]> {
    const entities = await this.repo.find({
      where: { questionBankId: bankId },
      relations: { uploader: true },
      order: { uploadedAt: 'DESC' },
    });
    return entities.map(this.toDomain.bind(this));
  }
}
