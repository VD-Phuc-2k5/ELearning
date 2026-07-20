import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { CreateQuestionInput } from '../../domain/repositories/question.repository.interface';
import { IExcelParserService } from '../../application/interfaces/i-excel-parser.service';

@Injectable()
export class ExcelParserService implements IExcelParserService {
  private readonly logger = new Logger(ExcelParserService.name);

  async parse(
    fileBuffer: Buffer,
  ): Promise<Omit<CreateQuestionInput, 'questionBankId'>[]> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(fileBuffer as unknown as ArrayBuffer);
    } catch (err) {
      this.logger.error(
        'Failed to parse Excel file for question import',
        (err as Error).stack,
      );
      throw new BadRequestException(
        'Không thể đọc file Excel. File có thể bị hỏng hoặc sai định dạng.',
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('File Excel không có sheet nào.');
    }

    const questions: Omit<CreateQuestionInput, 'questionBankId'>[] = [];
    const headerRow = worksheet.getRow(1);

    let questionCol = -1;
    const optionCols: { label: string; index: number }[] = [];
    let correctCol = -1;
    let explanationCol = -1;

    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || '')
        .trim()
        .toLowerCase();
      if (val === 'câu hỏi' || val.includes('câu hỏi') || val === 'content') {
        questionCol = colNumber;
      } else if (
        val === 'đáp án đúng' ||
        val.includes('đáp án đúng') ||
        val === 'correct' ||
        val === 'dap an dung'
      ) {
        correctCol = colNumber;
      } else if (
        val === 'giải thích' ||
        val.includes('giải thích') ||
        val === 'explanation' ||
        val === 'giai thich'
      ) {
        explanationCol = colNumber;
      } else if (val.startsWith('đáp án ') || val.startsWith('dap an ')) {
        const label = val
          .replace(/^(đáp án|dap an)\s+/i, '')
          .toUpperCase()
          .trim();
        optionCols.push({ label, index: colNumber });
      } else if (/^[a-f]$/i.test(val)) {
        optionCols.push({ label: val.toUpperCase(), index: colNumber });
      }
    });

    // Fallback if we couldn't locate the columns dynamically
    if (questionCol === -1 || correctCol === -1) {
      questionCol = 2;
      optionCols.length = 0;
      optionCols.push({ label: 'A', index: 3 });
      optionCols.push({ label: 'B', index: 4 });
      optionCols.push({ label: 'C', index: 5 });
      optionCols.push({ label: 'D', index: 6 });
      correctCol = 7;
      explanationCol = 8;
    }

    // Sort options to ensure A, B, C, D order
    optionCols.sort((a, b) => a.index - b.index);

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const getCellValue = (colIndex: number): string => {
        if (colIndex <= 0) return '';
        const cell = row.getCell(colIndex);
        if (!cell || cell.value === null || cell.value === undefined) return '';

        if (typeof cell.value === 'object') {
          if ('richText' in cell.value && Array.isArray(cell.value.richText)) {
            return cell.value.richText
              .map((rt: ExcelJS.RichText) => rt.text ?? '')
              .join('');
          }
          if ('result' in cell.value) {
            return String(cell.value.result ?? '').trim();
          }
          if ('text' in cell.value) {
            return String(cell.value.text ?? '').trim();
          }
          return String(cell.value).trim();
        }
        return String(cell.value).trim();
      };

      const content = getCellValue(questionCol);
      if (!content) return; // Skip empty rows (e.g. at the end of sheet)

      const explanation = getCellValue(explanationCol);
      const rawCorrect = getCellValue(correctCol);

      const correctOptionLabels = rawCorrect
        .split(/[,\s]+/)
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (correctOptionLabels.length === 0) {
        throw new BadRequestException(
          `Dòng ${rowNumber}: Chưa chọn đáp án đúng.`,
        );
      }

      const answerOptions: { optionLabel: string; content: string }[] = [];
      for (const opt of optionCols) {
        const val = getCellValue(opt.index);
        if (val) {
          answerOptions.push({
            optionLabel: opt.label,
            content: val,
          });
        }
      }

      if (answerOptions.length < 2) {
        throw new BadRequestException(
          `Dòng ${rowNumber}: Phải có ít nhất 2 đáp án.`,
        );
      }

      for (const label of correctOptionLabels) {
        if (!answerOptions.some((opt) => opt.optionLabel === label)) {
          throw new BadRequestException(
            `Dòng ${rowNumber}: Đáp án đúng "${label}" không nằm trong số các đáp án có nội dung.`,
          );
        }
      }

      questions.push({
        content,
        explanation: explanation || undefined,
        answerOptions,
        correctOptionLabels,
      });
    });

    if (questions.length === 0) {
      throw new BadRequestException(
        'Không tìm thấy dữ liệu câu hỏi hợp lệ trong file Excel.',
      );
    }

    return questions;
  }
}
