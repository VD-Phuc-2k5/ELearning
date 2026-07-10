export interface QuestionBankDomain {
  id: string;
  title: string;
  description: string | null;
  uploaderId: string | null;
  fileHash: string | null;
  totalQuestions: number;
  passingScore: number;
  statusId: string;
  rejectReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: { id: number; name: string }[];
  uploaderName?: string;
  lastUploadedAt?: Date | null;
}
