import { Inject, Injectable } from '@nestjs/common';
import {
  IExcelParserService,
  EXCEL_PARSER_SERVICE,
} from '../interfaces/i-excel-parser.service';
import { CreateQuestionInput } from '../../domain/repositories/question.repository.interface';

@Injectable()
export class ParseExcelUseCase {
  constructor(
    @Inject(EXCEL_PARSER_SERVICE)
    private readonly excelParserService: IExcelParserService,
  ) {}

  execute(
    fileBuffer: Buffer,
  ): Promise<Omit<CreateQuestionInput, 'questionBankId'>[]> {
    return this.excelParserService.parse(fileBuffer);
  }
}
