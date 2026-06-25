import { QuestionBankUploadDomain } from '../entities/question-bank-upload.domain';

export interface CreateUploadLogInput {
  questionBankId: string;
  uploadedBy: string;
  fileName: string | null;
  totalQuestionsImported: number;
}

export interface IUploadRepository {
  create(input: CreateUploadLogInput): Promise<QuestionBankUploadDomain>;
  findByBankId(bankId: string): Promise<QuestionBankUploadDomain[]>;
}

export const UPLOAD_REPOSITORY = Symbol('IUploadRepository');
