'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import QuizService, { type QuizResult } from '../../../../services/quiz.service';
import type { Mode } from './_components/types';
import { ModeSelect } from './_components/mode-select';
import { PracticeMode } from './_components/practice-mode';
import { ExamMode } from './_components/exam-mode';
import { ResultScreen } from './_components/result-screen';

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

    const { data: rawQuestions = [], isLoading } = useQuery({
        queryKey: ['quiz-questions', bankId],
        queryFn: () => QuizService.getQuestionsForQuiz(bankId),
        enabled: mode !== 'select',
    });

    // ponytail: shuffle once per load; stable until questions refetch
    const questions = useMemo(
        () => [...rawQuestions].sort(() => Math.random() - 0.5),
        [rawQuestions],
    );

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
