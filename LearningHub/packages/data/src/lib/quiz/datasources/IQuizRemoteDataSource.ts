import {
  AttemptList,
  BankHashResult,
  BankList,
  BankRoadmapItem,
  CreateBankQuizParams,
  DerivedBank,
  GetAttemptsParams,
  GetBanksQuizParams,
  ParseExcelResult,
  Question,
  QuestionBank,
  QuizAnswer,
  QuizAttemptDetail,
  QuizSubmitResult,
  Tag,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
  UploadExcelResult,
  UploadHistory,
  UserBankProgress,
  VerifyAnswerResult,
} from '@learning-hub/domain';

export interface IQuizRemoteDataSource {
  getBanks(params: GetBanksQuizParams): Promise<BankList>;
  getBankDetail(id: string): Promise<QuestionBank>;
  createBank(params: CreateBankQuizParams): Promise<QuestionBank>;
  updateBank(id: string, params: UpdateBankQuizParams): Promise<QuestionBank>;
  deleteBank(id: string): Promise<void>;
  uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    fileHash?: string,
  ): Promise<UploadExcelResult>;
  parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
  ): Promise<ParseExcelResult>;
  getUploadHistory(bankId: string): Promise<UploadHistory[]>;
  getQuestionsForQuiz(
    bankId: string,
    showAnswers?: boolean,
  ): Promise<Question[]>;
  verifyAnswer(
    questionId: string,
    selectedOptionId: string,
  ): Promise<VerifyAnswerResult>;
  submitQuiz(
    bankId: string,
    answers: QuizAnswer[],
    roadmapId?: string | null,
    durationSeconds?: number,
  ): Promise<QuizSubmitResult>;
  getAttempts(params: GetAttemptsParams): Promise<AttemptList>;
  getAttemptDetail(id: string): Promise<QuizAttemptDetail>;
  getBankProgress(bankId: string): Promise<UserBankProgress | null>;
  updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
  ): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  getTags(): Promise<Tag[]>;
  createTag(name: string): Promise<Tag>;
  deleteTag(id: number): Promise<void>;
  checkBankHash(hash: string): Promise<BankHashResult>;
  getDerivedBanks(bankId: string): Promise<DerivedBank[]>;
  getBankRoadmaps(bankId: string): Promise<BankRoadmapItem[]>;
}
