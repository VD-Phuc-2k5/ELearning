export interface QuestionBankDomain {
  id: string;
  title: string;
  description: string | null;
  uploaderId: string;
  fileHash: string | null;
  totalQuestions: number;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: { id: number; name: string }[];
}
