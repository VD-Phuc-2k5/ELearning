'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import gsap from 'gsap';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import { useConfirmModal } from '../../../../../components/ui/confirm-modal';
import { submitQuiz } from '../../../../actions/quiz.actions';
import { useExamLockdown } from './use-exam-lockdown';
import { ExamQuestionCard } from './exam-question-card';
import type { Question, QuizSubmitResult } from '@learning-hub/domain';

interface ExamModeProps {
  bankId: string;
  questions: Question[];
  timeLimitSeconds?: number;
  roadmapId?: string;
  onFinish: (result: QuizSubmitResult) => void;
}

export function ExamMode({
  bankId,
  questions,
  timeLimitSeconds,
  roadmapId,
  onFinish,
}: ExamModeProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | undefined>(
    timeLimitSeconds,
  );
  const startTimeRef = useRef(Date.now());
  const cardRef = useRef<HTMLDivElement>(null);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const result = await submitQuiz(
        bankId,
        questions
          .filter((q) => answers[q.id])
          .map((q) => ({
            questionId: q.id,
            selectedOptionId: answers[q.id],
          })),
        roadmapId,
        Math.round((Date.now() - startTimeRef.current) / 1000),
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: onFinish,
  });

  const { modal, openConfirm } = useConfirmModal();

  const { pendingSubmit, onConfirmSubmit, onCancelSubmit } = useExamLockdown(
    () => {
      if (!submitMutation.isPending && !submitMutation.isSuccess) {
        submitMutation.mutate();
      }
    },
  );

  useEffect(() => {
    if (pendingSubmit) {
      openConfirm(
        'Bạn đã rời khỏi trang làm bài. Bạn có muốn nộp bài không?',
        onConfirmSubmit,
        {
          confirmLabel: 'Nộp bài',
          cancelLabel: 'Hủy',
          variant: 'primary',
          onCancel: onCancelSubmit,
        },
      );
    }
  }, [pendingSubmit, openConfirm, onConfirmSubmit, onCancelSubmit]);

  useEffect(() => {
    if (!timeLimitSeconds) return;
    const id = setInterval(() => setTimeLeft((t) => (t ?? 0) - 1), 1000);
    return () => clearInterval(id);
  }, [timeLimitSeconds]);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !submitMutation.isPending &&
      !submitMutation.isSuccess
    ) {
      submitMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const question = questions[current];
  const answered = Object.keys(answers).length;

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, x: idx > current ? 20 : -20 },
      { opacity: 1, x: 0, duration: 0.25 },
    );
    setCurrent(idx);
  };

  const handleSubmit = () => {
    if (answered < questions.length) {
      openConfirm(
        `Còn ${questions.length - answered} câu chưa trả lời. Nộp bài?`,
        () => {
          if (!submitMutation.isPending && !submitMutation.isSuccess) {
            submitMutation.mutate();
          }
        },
        { confirmLabel: 'Nộp bài', cancelLabel: 'Hủy', variant: 'primary' },
      );
      return;
    }
    if (!submitMutation.isPending && !submitMutation.isSuccess) {
      submitMutation.mutate();
    }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => submitMutation.mutate()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Thoát
        </button>
        <div className="flex items-center gap-4">
          {timeLeft !== undefined && (
            <span
              className={clsx(
                'flex items-center gap-1.5 text-sm font-bold tabular-nums px-3 py-1.5 rounded-xl',
                timeLeft <= 60
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-slate-100 text-slate-700',
              )}
            >
              <Clock className="h-4 w-4" /> {fmt(Math.max(0, timeLeft))}
            </span>
          )}
          <span className="text-sm font-medium text-slate-500">
            Đã trả lời:{' '}
            <strong>
              {answered}/{questions.length}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => goTo(i)}
            className={clsx(
              'h-8 w-8 rounded-full text-xs font-bold transition border',
              i === current
                ? 'bg-indigo-600 text-white border-indigo-600'
                : answers[q.id]
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div ref={cardRef}>
        <ExamQuestionCard
          question={question}
          current={current}
          selectedOptionId={answers[question.id]}
          onSelectOption={(optionId) =>
            setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
          }
        />
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
            icon={<ChevronRight className="h-4 w-4" />}
            iconPosition="Right"
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={submitMutation.isPending}>
            Submit
          </Button>
        )}
      </div>
      {modal}
    </div>
  );
}
