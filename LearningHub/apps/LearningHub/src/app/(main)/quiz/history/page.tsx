'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../components/ui';
import { listAttempts } from '../../../actions/quiz-attempt.actions';
import '@aejkatappaja/phantom-ui';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pass: { label: 'Pass', cls: 'bg-emerald-100 text-emerald-700' },
  fail: { label: 'Fail', cls: 'bg-red-100 text-red-700' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
};

export default function QuizHistoryPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['quiz-attempts', page],
    queryFn: () => listAttempts({ page, limit }),
  });

  const attempts = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const fmtDur = (s: number | null) =>
    s ? `${Math.floor(s / 60)}m ${s % 60}s` : '—';

  if (isLoading)
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.2}
        className="block space-y-4"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100" />
        ))}
      </phantom-ui>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quiz History</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {total} attempt{total !== 1 ? 's' : ''} total
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No attempts yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Complete a quiz to see your history here
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {['Bank', 'Date', 'Score', 'Duration', 'Status', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attempts.map((a) => {
                  const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.fail;
                  const pct =
                    a.scorePercent !== null ? Math.round(a.scorePercent) : null;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[200px]">
                        {a.questionBankId}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {fmt(a.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {pct !== null ? (
                          <span
                            className={clsx(
                              'font-bold',
                              pct >= 60 ? 'text-emerald-600' : 'text-red-500',
                            )}
                          >
                            {pct}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {fmtDur(a.durationSeconds)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'text-xs font-semibold px-2 py-1 rounded-full',
                            badge.cls,
                          )}
                        >
                          {a.status === 'pass' ? (
                            <CheckCircle2 className="inline h-3 w-3 mr-0.5" />
                          ) : (
                            <XCircle className="inline h-3 w-3 mr-0.5" />
                          )}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/quiz/attempts/${a.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                          >
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
