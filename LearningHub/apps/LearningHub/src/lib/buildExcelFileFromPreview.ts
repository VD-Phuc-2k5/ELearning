import * as XLSX from 'xlsx';
import type { ParsedQuestion } from '@learning-hub/domain';

export function buildExcelFileFromPreview(
  questions: ParsedQuestion[],
  fileName = 'cau_hoi_bo_sung.xlsx',
): File {
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

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Questions');

  const arrayBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

  return new File([arrayBuffer], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
