'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import { getAttemptDetail } from '../../../../actions/quiz-attempt.actions';
import '@aejkatappaja/phantom-ui';

interface ReviewScreenProps {
  attemptId: string;
  onBack: () => void;
}

export function ReviewScreen({ attemptId, onBack }: ReviewScreenProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => getAttemptDetail(attemptId),
  });

  if (isLoading)
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.2}
        className="block space-y-4"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100" />
        ))}
      </phantom-ui>
    );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-rose-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">
          Không thể tải kết quả
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          {(error as Error)?.message || 'Vui lòng thử lại sau.'}
        </p>
      </div>
    );
  }

  const reviews = data?.reviewDetails ?? [];

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Review Answers</h2>
        <span className="ml-auto text-sm text-slate-400">
          {reviews.length} questions
        </span>
      </div>

      {reviews.map((r: any, idx: number) => (
        <div
          key={idx}
          className={clsx(
            'rounded-2xl border p-5 space-y-4',
            r.isCorrect
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-red-200 bg-red-50/50',
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-xs font-bold text-slate-400 mt-0.5 shrink-0">
              Q{idx + 1}
            </span>
            <p className="font-semibold text-slate-900 flex-1 text-sm leading-relaxed">
              {r.questionContent}
            </p>
            {r.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            )}
          </div>

          <div className="grid gap-2">
            {r.answerOptions.map((opt: any) => {
              const isCorrect = r.correctOptionIds.includes(opt.id);
              const isSelected = opt.id === r.selectedOptionId;
              return (
                <div
                  key={opt.id}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm',
                    isCorrect
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                      : isSelected
                        ? 'border-red-400 bg-red-100 text-red-800'
                        : 'border-slate-200 bg-white text-slate-600',
                  )}
                >
                  <span
                    className={clsx(
                      'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border',
                      isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isSelected
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-slate-100 text-slate-500 border-slate-200',
                    )}
                  >
                    {opt.optionLabel}
                  </span>
                  <span className="flex-1">{opt.content}</span>
                  {isCorrect && (
                    <span className="text-xs font-semibold text-emerald-600">
                      ✓ Correct
                    </span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="text-xs font-semibold text-red-600">
                      ✗ Your answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {r.explanation && (
            <div className="flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="prose prose-sm prose-slate max-w-none text-amber-900">
                <ReactMarkdown>{r.explanation}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ))}

      <Button variant="secondary" onClick={onBack} className="w-full">
        ← Back to Results
      </Button>
    </div>
  );
}
