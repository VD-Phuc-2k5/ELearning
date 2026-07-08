'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { listAttempts } from '../../actions/quiz-attempt.actions';
import { getBankDetail } from '../../actions/quiz.actions';
import { EmptyState } from '../../../components/ui';
import '@aejkatappaja/phantom-ui';

interface StatusBadge {
  label: string;
  cls: string;
}

const STATUS_BADGE: Record<string, StatusBadge> = {
  pass: { label: 'Pass', cls: 'bg-emerald-100 text-emerald-700' },
  fail: { label: 'Fail', cls: 'bg-red-100 text-red-700' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface Props {
  userId?: string;
}

export function RecentAttempts({ userId }: Props) {
  const {
    data,
    isLoading,
    error: attemptsError,
  } = useQuery({
    queryKey: ['quiz-attempts-recent', userId],
    queryFn: () => listAttempts({ limit: 5 }),
  });

  const attempts = data?.data ?? [];
  const uniqueBankIds = [
    ...new Set(attempts.map((a: any) => a.questionBankId as string)),
  ];

  const { data: bankTitles = {}, error: titlesError } = useQuery({
    queryKey: ['recent-bank-titles', uniqueBankIds],
    queryFn: async (): Promise<Record<string, string>> => {
      const banks = await Promise.all(
        uniqueBankIds.map((id: any) =>
          getBankDetail(id as string).catch(() => null),
        ),
      );
      const map: Record<string, string> = {};
      banks.forEach((b, i) => {
        if (b) map[uniqueBankIds[i] as string] = b.title;
      });
      return map;
    },
    enabled: uniqueBankIds.length > 0,
  });

  const titleOf = (id: string) => bankTitles[id] ?? `${id.slice(0, 8)}…`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Clock className="h-5 w-5 text-indigo-500" /> Recent Quiz Attempts
        </h3>
        {attempts.length > 0 && (
          <Link
            href="/quiz/history"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
          >
            View Full History <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {titlesError && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Không thể tải tiêu đề ngân hàng
        </p>
      )}

      {attemptsError ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-rose-200 bg-rose-50 text-center">
          <AlertCircle className="h-8 w-8 text-rose-400 mb-2" />
          <p className="text-sm font-medium text-rose-700">
            Không thể tải lịch sử làm bài
          </p>
        </div>
      ) : isLoading ? (
        <phantom-ui
          loading
          animation="pulse"
          reveal={0.2}
          className="block space-y-3"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100" />
          ))}
        </phantom-ui>
      ) : attempts.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8" />}
          title="No attempts yet"
          description="Complete a quiz to see your history here."
        />
      ) : (
        <div className="space-y-3">
          {attempts.map((a: any) => {
            const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.fail;
            const pct =
              a.scorePercent !== null ? Math.round(a.scorePercent) : null;
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/quiz/${a.questionBankId}`}
                    title={titleOf(a.questionBankId)}
                    className="block truncate font-semibold text-slate-900 transition hover:text-indigo-700"
                  >
                    {titleOf(a.questionBankId)}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {fmtTime(a.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {pct !== null ? (
                    <p
                      className={clsx(
                        'font-bold',
                        pct >= 60 ? 'text-emerald-600' : 'text-red-500',
                      )}
                    >
                      {pct}%
                    </p>
                  ) : (
                    <p className="text-slate-300">—</p>
                  )}
                </div>
                <span
                  className={clsx(
                    'inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-semibold',
                    badge.cls,
                  )}
                >
                  {a.status === 'pass' ? (
                    <CheckCircle2 className="mr-0.5 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-0.5 h-3 w-3" />
                  )}
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
