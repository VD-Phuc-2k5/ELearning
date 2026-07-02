'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import '@aejkatappaja/phantom-ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getBankDetail,
  getQuestionsForQuiz,
} from '../../../actions/quiz.actions';
import type { QuizSubmitResult } from '@learning-hub/domain';
import type { QuizMode } from './components/types';
import { ModeSelect } from './components/mode-select';
import { PracticeMode } from './components/practice-mode';
import { ExamMode } from './components/exam-mode';
import { ResultScreen } from './components/result-screen';
import { ReviewScreen } from './components/review-screen';
import { QuizProgressCard } from './components/quiz-progress-card';

export default function QuizPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const searchParams = useSearchParams();
  const roadmapId = searchParams.get('roadmapId') ?? undefined;
  const autoMode = searchParams.get('mode') as QuizMode | null;
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<QuizMode>(
    autoMode === 'practice' || autoMode === 'exam' || autoMode === 'timed-exam'
      ? autoMode
      : 'select',
  );
  const qc = useQueryClient();
  const [lastQuizMode, setLastQuizMode] = useState<QuizMode>('exam');
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<
    number | undefined
  >();

  const { data: bank } = useQuery({
    queryKey: ['bank', bankId],
    queryFn: () => getBankDetail(bankId),
  });

  const { data: rawQuestions = [], isLoading } = useQuery({
    queryKey: ['quiz-questions', bankId],
    queryFn: () => getQuestionsForQuiz(bankId),
    enabled: mode !== 'select',
  });

  // ponytail: shuffle once per load; stable until questions refetch
  const questions = useMemo(
    () => [...rawQuestions].sort(() => Math.random() - 0.5),
    [rawQuestions],
  );

  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(
      pageRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    );
  }, [mode]);

  if (isLoading && mode !== 'select') {
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.3}
        className="block max-w-2xl mx-auto"
      >
        <div className="space-y-6 py-8">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded-lg bg-slate-200" />
            <div className="h-8 w-20 rounded-xl bg-slate-200" />
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-5 w-3/4 rounded-lg bg-slate-200 mb-2" />
            <div className="h-5 w-1/2 rounded-lg bg-slate-200 mb-6" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-10 w-24 rounded-xl bg-slate-200" />
            <div className="h-10 w-24 rounded-xl bg-slate-200" />
          </div>
        </div>
      </phantom-ui>
    );
  }

  return (
    <div ref={pageRef} className="max-w-2xl mx-auto">
      {roadmapId && (
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href={`/roadmaps/${roadmapId}`}
            className="hover:text-slate-800 transition-colors"
          >
            Roadmap
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">
            {bank?.title ?? '...'}
          </span>
        </nav>
      )}
      {roadmapId && (
        <QuizProgressCard
          roadmapId={roadmapId}
          bankId={bankId}
          bankTitle={bank?.title}
        />
      )}
      {mode === 'select' && (
        <ModeSelect
          bank={bank}
          onSelectMode={(m, secs) => {
            setTimeLimitSeconds(secs);
            setMode(m);
          }}
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
          timeLimitSeconds={
            mode === 'timed-exam' ? timeLimitSeconds : undefined
          }
          roadmapId={roadmapId}
          onFinish={(r) => {
            setLastQuizMode(mode);
            setResult(r);
            setMode('result');
            if (roadmapId)
              qc.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
          }}
        />
      )}
      {mode === 'result' && result && (
        <>
          {!reviewMode ? (
            <ResultScreen
              result={result}
              roadmapId={roadmapId}
              bankId={bankId}
              quizMode={lastQuizMode}
              onRetry={() => {
                setResult(null);
                setMode('select');
              }}
              onReview={() => setReviewMode(true)}
            />
          ) : (
            <ReviewScreen
              attemptId={result.attemptId}
              onBack={() => setReviewMode(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
