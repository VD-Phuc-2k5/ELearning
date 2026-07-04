'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, BookOpen, Clock, User } from 'lucide-react';
import type { QuestionBank } from '@learning-hub/domain';
import {
  getPendingBanks,
  approveBank,
  rejectBank,
} from '../actions/quiz-bank-review.actions';
import { useState } from 'react';

export function QuizReviewTab() {
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: banks, isLoading } = useQuery<QuestionBank[]>({
    queryKey: ['admin-pending-banks'],
    queryFn: () => getPendingBanks(),
    refetchInterval: 30000,
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveBank(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-banks'] });
      setError('');
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'Duyệt thất bại.');
    },
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectBank(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-banks'] });
      setError('');
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'Từ chối thất bại.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {!banks?.length ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            Không có ngân hàng câu hỏi chờ duyệt
          </h3>
          <p className="mt-2 text-slate-500 max-w-sm text-sm">
            Tất cả ngân hàng câu hỏi đã được xử lý.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {bank.title}
                  </h3>
                  {bank.description && (
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                      {bank.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {bank.totalQuestions} câu hỏi
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {bank.uploaderName || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(bank.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {bank.tags && bank.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {bank.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => approveMut.mutate(bank.id)}
                    disabled={approveMut.isPending || rejectMut.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {approveMut.isPending ? 'Đang duyệt...' : 'Duyệt'}
                  </button>
                  <button
                    onClick={() => rejectMut.mutate(bank.id)}
                    disabled={approveMut.isPending || rejectMut.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition"
                  >
                    <XCircle className="h-4 w-4" />
                    {rejectMut.isPending ? 'Đang từ chối...' : 'Từ chối'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
