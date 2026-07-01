'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import gsap from 'gsap';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import { verifyAnswer } from '../../../../actions/quiz.actions';
import type { Question, VerifyAnswerResult } from '@learning-hub/domain';

interface PracticeModeProps {
  questions: Question[];
  onExit: () => void;
}

export function PracticeMode({ questions, onExit }: PracticeModeProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, VerifyAnswerResult>
  >({});
  const cardRef = useRef<HTMLDivElement>(null);

  const question = questions[current];
  const feedback = feedbackMap[question?.id];

  const verifyMutation = useMutation({
    mutationFn: (optionId: string) => verifyAnswer(question.id, optionId),
    onSuccess: (data) =>
      setFeedbackMap((prev) => ({ ...prev, [question.id]: data })),
  });

  const handleSelect = (optionId: string) => {
    if (feedback || verifyMutation.isPending) return;
    setSelected(optionId);
    verifyMutation.mutate(optionId);
  };

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, x: idx > current ? 20 : -20 },
      { opacity: 1, x: 0, duration: 0.25 },
    );
    setCurrent(idx);
    setSelected(null);
  };

  if (!question) return null;

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
        <span className="text-sm font-medium text-slate-500">
          {current + 1} / {questions.length}
        </span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div
        ref={cardRef}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6"
      >
        <p className="text-lg font-semibold text-slate-900 leading-relaxed">
          {question.content}
        </p>

        <div className="grid gap-3">
          {[...question.answerOptions]
            .sort((a, b) => a.optionLabel.localeCompare(b.optionLabel))
            .map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect =
                feedback?.correctOptionIds?.includes(opt.id) ?? false;
              const isWrong = isSelected && feedback && !feedback.isCorrect;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={!!feedback}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition',
                    !feedback &&
                      'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50',
                    isCorrect &&
                      'border-emerald-500 bg-emerald-50 text-emerald-800',
                    isWrong && 'border-red-400 bg-red-50 text-red-800',
                    feedback &&
                      !isCorrect &&
                      !isWrong &&
                      'border-slate-100 text-slate-400',
                  )}
                >
                  <span
                    className={clsx(
                      'h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border',
                      isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isWrong
                          ? 'bg-red-400 text-white border-red-400'
                          : 'bg-slate-100 text-slate-600 border-slate-200',
                    )}
                  >
                    {opt.optionLabel}
                  </span>
                  <span className="flex-1">{opt.content}</span>
                  {isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                  {isWrong && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
        </div>

        {feedback && (
          <>
            {!feedback.isCorrect && feedback.explanation && (
              <div className="flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-sm text-amber-900 whitespace-pre-wrap">
                  {feedback.explanation}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button
            onClick={() => goTo(current + 1)}
            iconPosition="Right"
            icon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        ) : (
          <Button onClick={onExit}>Finish</Button>
        )}
      </div>
    </div>
  );
}
