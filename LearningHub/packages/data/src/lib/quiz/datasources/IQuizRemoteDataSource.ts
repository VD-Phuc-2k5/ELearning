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
  getBanks(params: GetBanksQuizParams, token: string): Promise<BankList>;
  getBankDetail(id: string, token: string): Promise<QuestionBank>;
  createBank(
    params: CreateBankQuizParams,
    token: string,
  ): Promise<QuestionBank>;
  updateBank(
    id: string,
    params: UpdateBankQuizParams,
    token: string,
  ): Promise<QuestionBank>;
  deleteBank(id: string, token: string): Promise<void>;
  uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    token: string,
    fileHash?: string,
  ): Promise<UploadExcelResult>;
  parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    token: string,
  ): Promise<ParseExcelResult>;
  getUploadHistory(bankId: string, token: string): Promise<UploadHistory[]>;
  getQuestionsForQuiz(
    bankId: string,
    token: string,
    showAnswers?: boolean,
  ): Promise<Question[]>;
  verifyAnswer(
    questionId: string,
    selectedOptionId: string,
    token: string,
  ): Promise<VerifyAnswerResult>;
  submitQuiz(
    bankId: string,
    answers: QuizAnswer[],
    token: string,
    roadmapId?: string | null,
  ): Promise<QuizSubmitResult>;
  getAttempts(params: GetAttemptsParams, token: string): Promise<AttemptList>;
  getAttemptDetail(id: string, token: string): Promise<QuizAttemptDetail>;
  getBankProgress(
    bankId: string,
    token: string,
  ): Promise<UserBankProgress | null>;
  updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
    token: string,
  ): Promise<Question>;
  deleteQuestion(id: string, token: string): Promise<void>;
  getTags(token: string): Promise<Tag[]>;
  createTag(name: string, token: string): Promise<Tag>;
  deleteTag(id: number, token: string): Promise<void>;
  checkBankHash(hash: string, token: string): Promise<BankHashResult>;
  getDerivedBanks(bankId: string, token: string): Promise<DerivedBank[]>;
  getBankRoadmaps(bankId: string, token: string): Promise<BankRoadmapItem[]>;
}
