'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Map, BookOpen, AlertCircle } from 'lucide-react';
import { getRoadmapDetail } from '../../../../actions/roadmap.actions';
import { ProgressBar } from '../../../../../components/ui';
import '@aejkatappaja/phantom-ui';

interface QuizProgressCardProps {
  roadmapId: string;
  bankId: string;
  bankTitle?: string;
}

export function QuizProgressCard({
  roadmapId,
  bankId,
  bankTitle,
}: QuizProgressCardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['roadmap', roadmapId],
    queryFn: () => getRoadmapDetail(roadmapId),
  });

  if (isLoading) {
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.2}
        className="mb-4 block h-24 rounded-2xl bg-slate-100"
      />
    );
  }
  if (isError) {
    return (
      <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
        <AlertCircle className="h-5 w-5 text-rose-400 mx-auto mb-1" />
        <p className="text-sm font-medium text-rose-600">
          Không thể tải thông tin roadmap
        </p>
      </div>
    );
  }
  if (!data) return null;

  const total = data.items.length;
  const stepIdx = data.items.findIndex((i: any) => i.questionBankId === bankId);
  const step = stepIdx >= 0 ? stepIdx + 1 : 0;
  const pct = Math.round(data.userProgress?.progressPercent ?? 0);

  return (
    <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Map className="h-3.5 w-3.5" />
        <span>Roadmap</span>
      </div>
      <Link
        href={`/roadmaps/${roadmapId}`}
        className="mt-0.5 block truncate text-sm font-bold text-slate-900 transition hover:text-indigo-700"
      >
        {data.roadmap.title}
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <p className="text-slate-400">Question Bank</p>
          <p className="mt-0.5 flex items-center gap-1 font-semibold text-slate-800">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">{bankTitle ?? '—'}</span>
          </p>
        </div>
        <div>
          <p className="text-slate-400">Step</p>
          <p className="mt-0.5 font-semibold text-slate-800">
            {step > 0 ? `${step} / ${total}` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar
          value={pct}
          ariaLabel="Roadmap progress"
          className="flex-1"
        />
        <span className="text-xs font-bold text-indigo-600">{pct}%</span>
      </div>
    </div>
  );
}
