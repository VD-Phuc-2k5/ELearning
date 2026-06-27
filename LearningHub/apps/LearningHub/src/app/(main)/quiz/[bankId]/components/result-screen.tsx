'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Trophy, RotateCcw, BookOpen, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import type { QuizSubmitResult } from '../../../../actions/quiz.actions';

interface ResultScreenProps {
  result: QuizSubmitResult;
  roadmapId?: string;
  bankId: string;
  onRetry: () => void;
  onReview: () => void;
}

export function ResultScreen({
  result,
  roadmapId,
  bankId: _bankId,
  onRetry,
  onReview,
}: ResultScreenProps) {
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scoreRef.current) return;
    gsap.fromTo(
      scoreRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' },
    );
  }, []);

  const pct =
    result.scorePercent ??
    (result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0);
  const grade =
    pct >= 80
      ? { label: 'Excellent!', color: 'text-emerald-600' }
      : pct >= 60
        ? { label: 'Good job!', color: 'text-indigo-600' }
        : { label: 'Keep practicing!', color: 'text-amber-600' };

  const next = result.nextBank;

  return (
    <div className="space-y-8 py-8 text-center">
      <div ref={scoreRef} className="inline-flex flex-col items-center gap-4">
        <div className="h-28 w-28 rounded-full bg-indigo-50 border-4 border-indigo-100 flex flex-col items-center justify-center">
          <Trophy className="h-8 w-8 text-indigo-500 mb-1" />
          <span className="text-3xl font-extrabold text-indigo-700">
            {pct}%
          </span>
        </div>
        <h2 className={clsx('text-2xl font-bold', grade.color)}>
          {grade.label}
        </h2>
        <p className="text-slate-500">
          You answered <strong>{result.correctCount}</strong> /{' '}
          <strong>{result.totalQuestions}</strong> correctly
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: result.totalQuestions, color: '' },
          {
            label: 'Correct',
            value: result.correctCount,
            color: 'text-emerald-600',
          },
          {
            label: 'Wrong',
            value: result.totalQuestions - result.correctCount,
            color: 'text-red-500',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p
              className={clsx(
                'text-2xl font-bold mt-1',
                color || 'text-slate-900',
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {next && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-left space-y-3">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Next up · {next.position} / {next.totalBanks}
          </p>
          <p className="font-bold text-slate-900">{next.bankTitle}</p>
          <Link
            href={`/quiz/${next.bankId}?roadmapId=${roadmapId}`}
            className="block"
          >
            <Button
              className="w-full"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continue Learning
            </Button>
          </Link>
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <Button
          variant="secondary"
          onClick={onRetry}
          icon={<RotateCcw className="h-4 w-4" />}
        >
          Retry
        </Button>
        <Button
          variant="secondary"
          onClick={onReview}
          icon={<BookOpen className="h-4 w-4" />}
        >
          Review Answers
        </Button>
        {roadmapId && (
          <Link href={`/roadmaps/${roadmapId}`}>
            <Button variant="ghost">Back to Roadmap</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
