'use client';

import { clsx } from 'clsx';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Button } from '../../../../../components/ui';
import type { ParsedQuestion } from '@learning-hub/domain';

interface PreviewTableProps {
  preview: ParsedQuestion[];
  onChange: (preview: ParsedQuestion[]) => void;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  isSaveError: boolean;
}

export function PreviewTable({
  preview,
  onChange,
  onReset,
  onSave,
  isSaving,
  isSaveError,
}: PreviewTableProps) {
  const updateQuestion = (index: number, patch: Partial<ParsedQuestion>) => {
    onChange(
      preview.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const toggleCorrectOption = (index: number, optionLabel: string) => {
    const item = preview[index];
    const isCorrect = item.correctOptionLabels.includes(optionLabel);
    updateQuestion(index, {
      correctOptionLabels: isCorrect
        ? item.correctOptionLabels.filter((label) => label !== optionLabel)
        : [...item.correctOptionLabels, optionLabel],
    });
  };

  const removeQuestion = (index: number) => {
    onChange(preview.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Xem trước — {preview.length} câu hỏi
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Chỉnh sửa nội dung nếu cần, sau đó bấm "Lưu vào ngân hàng".
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Chọn file khác
        </button>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[480px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                Nội dung câu hỏi
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                Giải thích
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-[25%]">
                Đáp án đúng
              </th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {preview.map((q, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="h-full px-4 py-3 text-slate-400 font-medium align-center pt-4">
                  {i + 1}
                </td>
                <td className="px-4 py-3">
                  <textarea
                    className="w-full text-sm text-slate-800 bg-transparent resize-none outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 py-1 -mx-2 -my-1 min-h-[3rem]"
                    rows={4}
                    value={q.content}
                    onChange={(e) =>
                      updateQuestion(i, { content: e.target.value })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea
                    className="w-full text-sm text-slate-800 bg-transparent resize-none outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 py-1 -mx-2 -my-1 min-h-[3rem]"
                    rows={4}
                    value={q.explanation}
                    onChange={(e) =>
                      updateQuestion(i, { explanation: e.target.value })
                    }
                  />
                </td>
                <td className="px-4 py-3 space-y-1.5">
                  {q.answerOptions.map((opt) => (
                    <label
                      key={opt.optionLabel}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`preview-correct-${i}`}
                        checked={q.correctOptionLabels.includes(
                          opt.optionLabel,
                        )}
                        onChange={() => toggleCorrectOption(i, opt.optionLabel)}
                        className="accent-emerald-600 shrink-0"
                      />
                      <span
                        className={clsx(
                          'text-xs font-bold',
                          q.correctOptionLabels.includes(opt.optionLabel)
                            ? 'text-emerald-700'
                            : 'text-slate-500',
                        )}
                      >
                        {opt.optionLabel} {opt.content}
                      </span>
                    </label>
                  ))}
                </td>
                <td className="px-4 py-3 align-top pt-3">
                  <button
                    onClick={() => removeQuestion(i)}
                    className="p-1 text-slate-300 hover:text-red-500 transition rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isSaveError && (
        <div className="flex gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            Import thất bại. Vui lòng kiểm tra lại file.
          </p>
        </div>
      )}

      <Button
        onClick={onSave}
        isLoading={isSaving}
        disabled={preview.length === 0}
        icon={<Upload className="h-4 w-4" />}
      >
        Lưu {preview.length} câu hỏi vào ngân hàng
      </Button>
    </div>
  );
}
