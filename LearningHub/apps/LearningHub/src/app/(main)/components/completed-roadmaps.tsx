'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Trophy, ArrowUpRight, AlertCircle } from 'lucide-react';
import { getMyRoadmapProgress } from '../../actions/roadmap.actions';
import { EmptyState, ProgressBar } from '../../../components/ui';
import '@aejkatappaja/phantom-ui';

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

export function CompletedRoadmaps() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-roadmap-progress'],
    queryFn: () => getMyRoadmapProgress(),
  });

  const completed = (data ?? []).filter((p: any) => p.status === 'completed');

  return (
    <div className="space-y-5">
      <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <Trophy className="h-5 w-5 text-amber-500" /> Completed Roadmaps
      </h3>

      {error ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-rose-200 bg-rose-50 text-center">
          <AlertCircle className="h-8 w-8 text-rose-400 mb-2" />
          <p className="text-sm font-medium text-rose-700">
            Không thể tải tiến độ học tập
          </p>
        </div>
      ) : isLoading ? (
        <phantom-ui
          loading
          animation="pulse"
          reveal={0.2}
          className="block space-y-3"
        >
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100" />
          ))}
        </phantom-ui>
      ) : completed.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="No completed roadmaps yet"
          description="Finish a roadmap to celebrate it here."
        />
      ) : (
        <div className="space-y-3">
          {completed.map((p: any) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {p.roadmapTitle ?? p.roadmapId}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Completed {fmtDate(p.completedAt)}
                  </p>
                </div>
                <Link
                  href={`/roadmaps/${p.roadmapId}`}
                  aria-label={`View roadmap ${p.roadmapTitle ?? p.roadmapId}`}
                  className="inline-flex shrink-0 items-center rounded-lg p-2 text-slate-300 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar
                  value={p.progressPercent}
                  ariaLabel="Roadmap progress"
                  className="flex-1"
                  barClassName="bg-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-600">
                  {Math.round(p.progressPercent)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
