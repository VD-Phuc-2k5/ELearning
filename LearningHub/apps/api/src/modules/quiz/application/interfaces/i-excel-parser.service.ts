import { CreateQuestionInput } from '../../domain/repositories/question.repository.interface';

export interface IExcelParserService {
  parse(
    fileBuffer: Buffer,
  ): Promise<Omit<CreateQuestionInput, 'questionBankId'>[]>;
}

export const EXCEL_PARSER_SERVICE = Symbol('IExcelParserService');
