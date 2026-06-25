export interface QuestionBankUploadDomain {
  id: string;
  questionBankId: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileName: string | null;
  totalQuestionsImported: number;
  uploaderUsername?: string;
}
