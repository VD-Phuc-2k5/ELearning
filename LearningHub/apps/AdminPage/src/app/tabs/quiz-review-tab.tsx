'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  AlertCircle,
  Send,
} from 'lucide-react';
import type { QuestionBank, Question } from '@learning-hub/domain';
import {
  getPendingBanks,
  approveBank,
  rejectBank,
  getBankQuestions,
} from '../actions/quiz-bank-review.actions';
import { useState, useEffect, useRef } from 'react';
import { cookie } from '@learning-hub/core';

export function QuizReviewTab() {
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{
    bankId: string;
    title: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: banks,
    isLoading,
    isError,
    error: queryError,
  } = useQuery<QuestionBank[]>({
    queryKey: ['admin-pending-banks'],
    queryFn: () => getPendingBanks(),
    refetchInterval: 30000,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery<
    Question[]
  >({
    queryKey: ['admin-bank-questions', expandedId],
    queryFn: () => (expandedId ? getBankQuestions(expandedId) : []),
    enabled: !!expandedId,
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
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectBank(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-banks'] });
      setRejectTarget(null);
      setRejectReason('');
      setError('');
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'Từ chối thất bại.');
    },
  });

  const socketRef = useRef<ReturnType<
    typeof import('socket.io-client').io
  > | null>(null);

  useEffect(() => {
    const connect = async () => {
      const { io } = await import('socket.io-client');
      const socketUrl = (
        process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
      ).replace(/\/api\/?$/, '');
      const socket = io(`${socketUrl}/forum`, {
        auth: (cb: (data: { token: string }) => void) => {
          const t = cookie.read('accessToken') ?? '';
          cb({ token: t });
        },
        transports: ['websocket'],
        autoConnect: false,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join:admin-quiz');
      });

      socket.on('bank:reviewed', () => {
        qc.invalidateQueries({ queryKey: ['admin-pending-banks'] });
      });

      socket.connect();
    };

    const cleanup = connect();
    return () => {
      cleanup.then(() => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      });
    };
  }, [qc]);

  const openRejectDialog = (bankId: string, title: string) => {
    setRejectTarget({ bankId, title });
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (!rejectTarget) return;
    rejectMut.mutate({
      id: rejectTarget.bankId,
      reason: rejectReason.trim() || undefined,
    });
  };

  const toggleDetail = (bankId: string) => {
    setExpandedId((prev) => (prev === bankId ? null : bankId));
  };

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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-red-200 bg-white p-16 text-center">
        <XCircle className="h-12 w-12 text-red-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">
          Không thể tải danh sách chờ duyệt
        </h3>
        <p className="mt-2 text-slate-500 max-w-sm text-sm">
          {queryError instanceof Error
            ? queryError.message
            : 'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.'}
        </p>
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
          {banks.map((bank) => {
            const isExpanded = expandedId === bank.id;
            const isLoadingDetail = isExpanded && questionsLoading;

            return (
              <div
                key={bank.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
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
                        onClick={() => toggleDetail(bank.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
                      >
                        <Eye className="h-4 w-4" />
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => approveMut.mutate(bank.id)}
                        disabled={approveMut.isPending || rejectMut.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {approveMut.isPending ? 'Đang duyệt...' : 'Duyệt'}
                      </button>
                      <button
                        onClick={() => openRejectDialog(bank.id, bank.title)}
                        disabled={approveMut.isPending || rejectMut.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        {rejectMut.isPending ? 'Đang từ chối...' : 'Từ chối'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                    {isLoadingDetail ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : questions.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">
                        Ngân hàng câu hỏi này chưa có câu hỏi nào.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {questions.length} câu hỏi
                        </p>
                        {questions.map((q: Question, idx: number) => (
                          <div
                            key={q.id}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              Câu {idx + 1}: {q.content}
                            </p>
                            <div className="mt-3 space-y-1.5">
                              {q.answerOptions.map((opt) => {
                                const isCorrect =
                                  q.correctAnswerOptionIds?.includes(opt.id);
                                return (
                                  <div
                                    key={opt.id}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                      isCorrect
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                                    }`}
                                  >
                                    <span
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
                                        isCorrect
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-slate-300 text-slate-700'
                                      }`}
                                    >
                                      {opt.optionLabel}
                                    </span>
                                    <span>{opt.content}</span>
                                    {isCorrect && (
                                      <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {q.explanation && (
                              <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
                                <span className="font-medium">Giải thích:</span>{' '}
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Từ chối ngân hàng câu hỏi
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  &quot;{rejectTarget.title}&quot;
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối để thông báo cho người dùng..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                disabled={rejectMut.isPending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={rejectMut.isPending}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                {rejectMut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang từ chối...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
