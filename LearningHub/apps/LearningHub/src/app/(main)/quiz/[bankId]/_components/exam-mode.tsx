'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import gsap from 'gsap';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import QuizService, { type Question, type QuizResult } from '../../../../../services/quiz.service';

interface ExamModeProps {
    bankId: string;
    questions: Question[];
    timeLimitSeconds?: number;
    onFinish: (result: QuizResult) => void;
    onExit: () => void;
}

export function ExamMode({ bankId, questions, timeLimitSeconds, onFinish, onExit }: ExamModeProps) {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | undefined>(timeLimitSeconds);
    const cardRef = useRef<HTMLDivElement>(null);

    const submitMutation = useMutation({
        mutationFn: () => QuizService.submitQuiz(
            bankId,
            questions
                .map(q => ({ questionId: q.id, selectedOptionId: answers[q.id] || '' }))
                .filter(a => a.selectedOptionId)
        ),
        onSuccess: onFinish,
    });

    useEffect(() => {
        if (!timeLimitSeconds) return;
        const id = setInterval(() => setTimeLeft(t => (t ?? 0) - 1), 1000);
        return () => clearInterval(id);
    }, [timeLimitSeconds]);

    useEffect(() => {
        if (timeLeft === 0 && !submitMutation.isPending && !submitMutation.isSuccess) {
            submitMutation.mutate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const question = questions[current];
    const answered = Object.keys(answers).length;

    const goTo = (idx: number) => {
        if (idx < 0 || idx >= questions.length) return;
        gsap.fromTo(cardRef.current, { opacity: 0, x: idx > current ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.25 });
        setCurrent(idx);
    };

    const handleSubmit = () => {
        if (answered < questions.length) {
            if (!confirm(`Còn ${questions.length - answered} câu chưa trả lời. Nộp bài?`)) return;
        }
        submitMutation.mutate();
    };

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <button onClick={onExit} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
                    <ArrowLeft className="h-4 w-4" /> Thoát
                </button>
                <div className="flex items-center gap-4">
                    {timeLeft !== undefined && (
                        <span className={clsx(
                            'flex items-center gap-1.5 text-sm font-bold tabular-nums px-3 py-1.5 rounded-xl',
                            timeLeft <= 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
                        )}>
                            <Clock className="h-4 w-4" /> {fmt(Math.max(0, timeLeft))}
                        </span>
                    )}
                    <span className="text-sm font-medium text-slate-500">
                        Đã trả lời: <strong>{answered}/{questions.length}</strong>
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
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                        )}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <div ref={cardRef} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
                <p className="text-sm text-slate-500 font-medium">Question {current + 1}</p>
                <p className="text-lg font-semibold text-slate-900 leading-relaxed">{question.content}</p>

                <div className="grid gap-3">
                    {[...question.answerOptions].sort((a, b) => a.optionLabel.localeCompare(b.optionLabel)).map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt.id }))}
                            className={clsx(
                                'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition',
                                answers[question.id] === opt.id
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                            )}
                        >
                            <span className={clsx(
                                'h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border',
                                answers[question.id] === opt.id
                                    ? 'bg-indigo-500 text-white border-indigo-500'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                            )}>
                                {opt.optionLabel}
                            </span>
                            {opt.content}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={() => goTo(current - 1)} disabled={current === 0} icon={<ChevronLeft className="h-4 w-4" />}>
                    Previous
                </Button>
                {current < questions.length - 1 ? (
                    <Button onClick={() => goTo(current + 1)}>
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} isLoading={submitMutation.isPending}>
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
}
