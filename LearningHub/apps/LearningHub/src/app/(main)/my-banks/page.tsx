'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanks } from '../../actions/quiz.actions';
import type { QuestionBank } from '@learning-hub/domain';
import { useCurrentUser } from '../../../components/hooks/use-current-user';
import { Button } from '../../../components/ui';
import { Plus, BookOpen, Share2, Upload, FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function MyBanksPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading } = useQuery({
    queryKey: ['my-banks', page],
    queryFn: () => getBanks({ page, limit, uploaderId: user?.id }),
    enabled: !!user,
  });
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            My Question Banks
          </h2>
          <p className="mt-1 text-slate-500">
            Manage and share your multiple-choice question sets.
          </p>
        </div>
        <Link href="/my-banks/create">
          <Button icon={<Plus className="h-4 w-full" />}>New Bank</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((bank: QuestionBank) => (
            <div
              key={bank.id}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">
                    {bank.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {bank.totalQuestions} questions ·{' '}
                    {new Date(bank.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500 line-clamp-2 h-10 flex-1">
                {bank.description ||
                  'No description provided for this question bank.'}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="h-3 w-3" /> Quiz
                  </span>
                  {bank.fileHash && (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <Share2 className="h-3 w-3" /> Shared
                    </span>
                  )}
                </div>
                <Link href={`/my-banks/${bank.id}`}>
                  <Button size="sm" variant="secondary">
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 mb-5">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No question banks yet
          </h3>
          <p className="mt-2 text-slate-500 max-w-sm text-sm">
            Get started by creating a new question set or importing one from an
            Excel file.
          </p>
          <div className="mt-8">
            <Link href="/my-banks/create">
              <Button icon={<Plus className="h-4 w-4" />}>
                Create your first bank
              </Button>
            </Link>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
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
    </div>
  );
}
