import * as ExcelJS from 'exceljs';
import type { ParsedQuestion } from '@learning-hub/domain';

export async function buildExcelFileFromPreview(
  questions: ParsedQuestion[],
  fileName = 'cau_hoi_bo_sung.xlsx',
): Promise<File> {
  const optionCount = Math.max(
    2,
    ...questions.map((q) => q.answerOptions.length),
  );
  const optionLabels = Array.from({ length: optionCount }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  const headers = [
    'STT',
    'Câu hỏi',
    ...optionLabels.map((label) => `Đáp án ${label}`),
    'Đáp án đúng',
    'Giải thích',
  ];

  const rows = questions.map((q, index) => {
    const contentByLabel = new Map(
      q.answerOptions.map((opt) => [opt.optionLabel, opt.content]),
    );
    return [
      index + 1,
      q.content,
      ...optionLabels.map((label) => contentByLabel.get(label) ?? ''),
      q.correctOptionLabels.join(', '),
      q.explanation ?? '',
    ];
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Quiz Questions');

  worksheet.addRow(headers);
  worksheet.addRows(rows);

  const buffer = await workbook.xlsx.writeBuffer();

  return new File([buffer], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
