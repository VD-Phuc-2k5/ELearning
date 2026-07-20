'use client';

import { clsx } from 'clsx';
import type { Question } from '@learning-hub/domain';

interface ExamQuestionCardProps {
  question: Question;
  current: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export function ExamQuestionCard({
  question,
  current,
  selectedOptionId,
  onSelectOption,
}: ExamQuestionCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
      <p className="text-sm text-slate-500 font-medium">
        Question {current + 1}
      </p>
      <p className="text-lg font-semibold text-slate-900 leading-relaxed">
        {question.content}
      </p>

      <div className="grid gap-3">
        {[...question.answerOptions]
          .sort((a, b) => a.optionLabel.localeCompare(b.optionLabel))
          .map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={clsx(
                'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition',
                selectedOptionId === opt.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50',
              )}
            >
              <span
                className={clsx(
                  'h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border',
                  selectedOptionId === opt.id
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-slate-100 text-slate-600 border-slate-200',
                )}
              >
                {opt.optionLabel}
              </span>
              {opt.content}
            </button>
          ))}
      </div>
    </div>
  );
}
