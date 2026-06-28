'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanks } from '../../actions/quiz.actions';
import type { QuestionBank } from '@learning-hub/domain';
import { Button } from '../../../components/ui';
import { Search, BookOpen, Filter, Star, Clock } from 'lucide-react';

export default function CommunityPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data: banks, isLoading } = useQuery({
    queryKey: ['community-banks', page],
    queryFn: () => getBanks({ page, limit }),
  });
  const totalPages = Math.ceil((banks?.total ?? 0) / limit);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white md:px-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
            Community
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Shared Knowledge Hub
          </h2>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            Discover thousands of quality question sets from top educators and
            learners. Learn without limits.
          </p>

          <div className="mt-10 flex max-w-md items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/15">
            <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search banks, topics..."
              className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 text-sm outline-none"
            />
            <Button size="sm" className="shrink-0 rounded-xl">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="p-6 rounded-xl flex items-center gap-2"
          >
            <Filter className="h-4 w-full" /> Filter
          </Button>
          <div className="hidden sm:flex gap-4 text-sm font-semibold">
            <span className="text-indigo-600 cursor-pointer">Latest</span>
            <span className="text-slate-400 cursor-pointer hover:text-slate-900 transition">
              Popular
            </span>
            <span className="text-slate-400 cursor-pointer hover:text-slate-900 transition">
              Featured
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-400 font-medium">
          {banks?.total ?? 0} results
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banks?.data?.map((bank: QuestionBank) => (
            <div
              key={bank.id}
              className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-2 shadow-sm transition hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl flex items-center justify-center relative">
                <BookOpen className="h-10 w-10 text-indigo-200" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> 4.9
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                  {bank.title}
                </h3>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 10 min
                  </span>
                  <span>{bank.totalQuestions} questions</span>
                </div>
                <p className="mt-3 text-sm text-slate-500 line-clamp-2 flex-1">
                  {bank.description ||
                    'Build your foundational and advanced knowledge through this question set.'}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                      U
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      User_{bank.uploaderId.substring(0, 4)}
                    </span>
                  </div>
                  <Button size="sm">Study now</Button>
                </div>
              </div>
            </div>
          ))}
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
