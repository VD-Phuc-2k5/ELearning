'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowLeft,
  Map,
  CheckCircle2,
  Circle,
  PlayCircle,
  Edit2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../components/ui';
import {
  getRoadmapDetail,
  enrollRoadmap,
} from '../../../actions/roadmap.actions';
import '@aejkatappaja/phantom-ui';

const STATUS_CONFIG = {
  completed: {
    border: 'border-emerald-200 bg-emerald-50',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    btn: 'secondary' as const,
    label: 'Retry',
  },
  in_progress: {
    border: 'border-indigo-200 bg-indigo-50',
    icon: <PlayCircle className="h-5 w-5 text-indigo-500" />,
    btn: 'primary' as const,
    label: 'Continue',
  },
  not_started: {
    border: 'border-slate-100 bg-white',
    icon: <Circle className="h-5 w-5 text-slate-300" />,
    btn: 'secondary' as const,
    label: 'Start',
  },
} as const;

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => getRoadmapDetail(id),
  });

  const enroll = useMutation({
    mutationFn: () => enrollRoadmap(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roadmap', id] }),
  });

  const completedBankIds = useMemo(
    () => new Set(data?.completedBankIds ?? []),
    [data?.completedBankIds],
  );
  const totalQuestions = useMemo(
    () =>
      (data?.items ?? []).reduce(
        (sum, i) => sum + (i.bankTotalQuestions ?? 0),
        0,
      ),
    [data?.items],
  );

  if (isLoading)
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.2}
        className="block max-w-3xl mx-auto space-y-6"
      >
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-200" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100" />
        ))}
      </phantom-ui>
    );

  if (!data) return null;
  const { roadmap, items, userProgress } = data;
  const completed = userProgress?.completedBanks ?? 0;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getBankStatus = (bankId: string): keyof typeof STATUS_CONFIG => {
    if (completedBankIds.has(bankId)) return 'completed';
    if (!userProgress) return 'not_started';
    if (
      userProgress.currentBankId === bankId ||
      userProgress.lastAccessedBankId === bankId
    )
      return 'in_progress';
    return 'not_started';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Map className="h-3.5 w-3.5" />
            <span>Roadmap</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 truncate">
            {roadmap.title}
          </h1>
        </div>
        <Link href={`/roadmaps/manage/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 className="h-3.5 w-3.5" />}
          >
            Edit
          </Button>
        </Link>
      </div>

      {roadmap.description && (
        <p className="text-slate-500 text-sm">{roadmap.description}</p>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Progress</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {completed}{' '}
              <span className="text-slate-400 text-base font-medium">
                / {total} banks
              </span>
            </p>
            {totalQuestions > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {totalQuestions} questions total
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-indigo-600">{pct}%</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {!userProgress && (
          <Button
            onClick={() => enroll.mutate()}
            isLoading={enroll.isPending}
            className="w-full"
          >
            Start Learning
          </Button>
        )}
        {userProgress && (
          <Link
            href={
              userProgress.currentBankId
                ? `/quiz/${userProgress.currentBankId}?roadmapId=${id}`
                : '/quiz'
            }
          >
            <Button className="w-full">Continue Learning →</Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Curriculum ({total} banks)
        </h2>
        {items.map((item, idx) => {
          const status = getBankStatus(item.questionBankId);
          const cfg = STATUS_CONFIG[status];
          return (
            <div
              key={item.id}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-2xl border transition',
                cfg.border,
              )}
            >
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">
                  {idx + 1}
                </span>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate text-sm">
                  {item.bankTitle}
                </p>
                {item.bankTotalQuestions !== undefined && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.bankTotalQuestions} questions
                  </p>
                )}
              </div>
              <Link href={`/quiz/${item.questionBankId}?roadmapId=${id}`}>
                <Button size="sm" variant={cfg.btn}>
                  {cfg.label}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
