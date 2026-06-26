'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import gsap from 'gsap';
import QuizService, { type Question, type QuizResult } from '../../../../services/quiz.service';
import { Button } from '../../../../components/ui';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Trophy,
    RotateCcw,
    Zap,
    ClipboardList,
    Clock,
} from 'lucide-react';
import { clsx } from 'clsx';

type Mode = 'select' | 'practice' | 'exam' | 'timed-exam' | 'result';

export default function QuizPage() {
    const { bankId } = useParams<{ bankId: string }>();
    const router = useRouter();
    const pageRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<Mode>('select');
    const [result, setResult] = useState<QuizResult | null>(null);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | undefined>();

    const { data: bank } = useQuery({
        queryKey: ['bank', bankId],
        queryFn: () => QuizService.getBankDetail(bankId),
    });

    const { data: questions = [], isLoading } = useQuery({
        queryKey: ['quiz-questions', bankId],
        queryFn: () => QuizService.getQuestionsForQuiz(bankId),
        enabled: mode !== 'select',
    });

    useEffect(() => {
        if (!pageRef.current) return;
        gsap.fromTo(pageRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }, [mode]);

    if (isLoading && mode !== 'select') {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent" />
            </div>
        );
    }

    return (
        <div ref={pageRef} className="max-w-2xl mx-auto">
            {mode === 'select' && (
                <ModeSelect
                    bank={bank}
                    onSelectMode={(m, secs) => { setTimeLimitSeconds(secs); setMode(m); }}
                    onBack={() => router.back()}
                />
            )}
            {mode === 'practice' && questions.length > 0 && (
                <PracticeMode questions={questions} onExit={() => setMode('select')} />
            )}
            {(mode === 'exam' || mode === 'timed-exam') && questions.length > 0 && (
                <ExamMode
                    bankId={bankId}
                    questions={questions}
                    timeLimitSeconds={mode === 'timed-exam' ? timeLimitSeconds : undefined}
                    onFinish={(r) => { setResult(r); setMode('result'); }}
                    onExit={() => setMode('select')}
                />
            )}
            {mode === 'result' && result && (
                <ResultScreen result={result} onRetry={() => { setResult(null); setMode('select'); }} />
            )}
        </div>
    );
}

// ─── Mode Select ───────────────────────────────────────────────────────────────

function ModeSelect({ bank, onSelectMode, onBack }: {
    bank: any;
    onSelectMode: (m: Mode, timeLimitSeconds?: number) => void;
    onBack: () => void;
}) {
    const [timedMinutes, setTimedMinutes] = useState(30);

    return (
        <div className="space-y-8 py-8">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{bank?.title || 'Practice'}</h2>
                    <p className="text-slate-500 text-sm">{bank?.totalQuestions || 0} câu hỏi</p>
                </div>
            </div>

            <div className="grid gap-4">
                <ModeCard
                    icon={<Zap className="h-8 w-8" />}
                    title="Luyện tập"
                    description="Trả lời từng câu, xem kết quả ngay. Không tính điểm."
                    color="bg-amber-500"
                    onClick={() => onSelectMode('practice')}
                />
                <ModeCard
                    icon={<ClipboardList className="h-8 w-8" />}
                    title="Thi thử"
                    description="Trả lời tất cả rồi nộp một lần, xem kết quả chi tiết."
                    color="bg-indigo-600"
                    onClick={() => onSelectMode('exam')}
                />
                <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="h-16 w-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                        <Clock className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">Thi có tính giờ</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <label className="text-sm text-slate-500">Thời gian:</label>
                            <input
                                type="number"
                                min={1}
                                max={180}
                                value={timedMinutes}
                                onChange={e => setTimedMinutes(Math.max(1, Number(e.target.value)))}
                                className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1 text-center focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                            />
                            <span className="text-sm text-slate-500">phút</span>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelectMode('timed-exam', timedMinutes * 60)}
                        className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition shrink-0"
                    >
                        Bắt đầu
                    </button>
                </div>
            </div>

            {bank?.id && (
                <Link href={`/my-banks/${bank.id}`} className="block text-center text-sm text-slate-500 hover:text-indigo-600 transition">
                    ← Quay lại ngân hàng câu hỏi
                </Link>
            )}
        </div>
    );
}

function ModeCard({ icon, title, description, color, onClick }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-6 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
            <div className={clsx('h-16 w-16 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-lg', color)}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
        </button>
    );
}

// ─── Practice Mode ─────────────────────────────────────────────────────────────

function PracticeMode({ questions, onExit }: { questions: Question[]; onExit: () => void }) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [feedbackMap, setFeedbackMap] = useState<Record<string, { isCorrect: boolean; correctOptionId?: string }>>({});
    const cardRef = useRef<HTMLDivElement>(null);

    const question = questions[current];
    const feedback = feedbackMap[question?.id];

    const verifyMutation = useMutation({
        mutationFn: (optionId: string) => QuizService.verifyAnswer(question.id, optionId),
        onSuccess: (data) => setFeedbackMap(prev => ({ ...prev, [question.id]: data })),
    });

    const handleSelect = (optionId: string) => {
        if (feedback || verifyMutation.isPending) return;
        setSelected(optionId);
        verifyMutation.mutate(optionId);
    };

    const goTo = (idx: number) => {
        if (idx < 0 || idx >= questions.length) return;
        gsap.fromTo(cardRef.current, { opacity: 0, x: idx > current ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.25 });
        setCurrent(idx);
        setSelected(null);
    };

    if (!question) return null;

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <button onClick={onExit} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
                    <ArrowLeft className="h-4 w-4" /> Exit
                </button>
                <span className="text-sm font-medium text-slate-500">{current + 1} / {questions.length}</span>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
            </div>

            <div ref={cardRef} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
                <p className="text-lg font-semibold text-slate-900 leading-relaxed">{question.content}</p>

                <div className="grid gap-3">
                    {question.answerOptions.map(opt => {
                        const isSelected = selected === opt.id;
                        const isCorrect = feedback?.correctOptionId === opt.id;
                        const isWrong = isSelected && feedback && !feedback.isCorrect;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelect(opt.id)}
                                disabled={!!feedback}
                                className={clsx(
                                    'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition',
                                    !feedback && 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50',
                                    isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-800',
                                    isWrong && 'border-red-400 bg-red-50 text-red-800',
                                    feedback && !isCorrect && !isWrong && 'border-slate-100 text-slate-400',
                                )}
                            >
                                <span className={clsx(
                                    'h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border',
                                    isCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                                    isWrong ? 'bg-red-400 text-white border-red-400' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                )}>
                                    {opt.optionLabel}
                                </span>
                                <span className="flex-1">{opt.content}</span>
                                {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                                {isWrong && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {feedback && (
                    <div className={clsx(
                        'rounded-2xl p-4 flex items-center gap-3 text-sm font-medium',
                        feedback.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    )}>
                        {feedback.isCorrect
                            ? <><CheckCircle2 className="h-5 w-5 shrink-0" /> Correct! Great job.</>
                            : <><XCircle className="h-5 w-5 shrink-0" /> Incorrect. The correct answer is highlighted.</>
                        }
                    </div>
                )}
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
                    <Button onClick={onExit}>Finish</Button>
                )}
            </div>
        </div>
    );
}

// ─── Exam Mode ─────────────────────────────────────────────────────────────────

function ExamMode({ bankId, questions, timeLimitSeconds, onFinish, onExit }: {
    bankId: string;
    questions: Question[];
    timeLimitSeconds?: number;
    onFinish: (result: QuizResult) => void;
    onExit: () => void;
}) {
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

    // countdown ticker
    useEffect(() => {
        if (!timeLimitSeconds) return;
        const id = setInterval(() => setTimeLeft(t => (t ?? 0) - 1), 1000);
        return () => clearInterval(id);
    }, [timeLimitSeconds]);

    // auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && !submitMutation.isPending && !submitMutation.isSuccess) {
            submitMutation.mutate();
        }
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

            {/* Question navigator dots */}
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
                    {question.answerOptions.map(opt => (
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

// ─── Result Screen ─────────────────────────────────────────────────────────────

function ResultScreen({ result, onRetry }: { result: QuizResult; onRetry: () => void }) {
    const scoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scoreRef.current) return;
        gsap.fromTo(scoreRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' });
    }, []);

    const pct = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 0;
    const grade =
        pct >= 80 ? { label: 'Excellent!', color: 'text-emerald-600' } :
        pct >= 60 ? { label: 'Good job!', color: 'text-indigo-600' } :
        { label: 'Keep practicing!', color: 'text-amber-600' };

    return (
        <div className="space-y-8 py-8 text-center">
            <div ref={scoreRef} className="inline-flex flex-col items-center gap-4">
                <div className="h-28 w-28 rounded-full bg-indigo-50 border-4 border-indigo-100 flex flex-col items-center justify-center">
                    <Trophy className="h-8 w-8 text-indigo-500 mb-1" />
                    <span className="text-3xl font-extrabold text-indigo-700">{pct}%</span>
                </div>
                <h2 className={clsx('text-2xl font-bold', grade.color)}>{grade.label}</h2>
                <p className="text-slate-500">
                    You answered <strong>{result.correctCount}</strong> / <strong>{result.totalQuestions}</strong> correctly
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: result.totalQuestions, color: '' },
                    { label: 'Correct', value: result.correctCount, color: 'text-emerald-600' },
                    { label: 'Sai', value: result.totalQuestions - result.correctCount, color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className={clsx('text-2xl font-bold mt-1', color || 'text-slate-900')}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={onRetry} icon={<RotateCcw className="h-4 w-4" />}>
                    Retry
                </Button>
            </div>
        </div>
    );
}
