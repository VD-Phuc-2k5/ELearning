'use client';

import { useEffect, useRef, useState, type ElementType } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import gsap from 'gsap';
import { io } from 'socket.io-client';
import { cookie } from '@learning-hub/core';
import {
  getBankDetail,
  getQuestionsForQuiz,
  getUploadHistory,
  getDerivedBanks,
  getTags,
  updateBank,
  createTag,
  deleteTag,
  deleteBank,
} from '../../../actions/quiz.actions';
import type { Tag } from '@learning-hub/domain';
import { Button, useConfirmModal } from '../../../../components/ui';
import {
  ArrowLeft,
  BookOpen,
  Upload,
  History,
  Trash2,
  Play,
  AlertCircle,
  X,
  BarChart2,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { BankDetailTab } from './components/types';
import { QuestionsTab } from './components/questions-tab';
import { UploadTab } from './components/upload-tab';
import { HistoryTab } from './components/history-tab';
import { StatsTab } from './components/stats-tab';
import { RoadmapMembershipSection } from './components/roadmap-membership-section';

export default function BankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pageRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<BankDetailTab>('questions');
  const [tagOpen, setTagOpen] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');
  const { modal: confirmModal, openConfirm } = useConfirmModal();

  const { data: bank, isLoading: bankLoading } = useQuery({
    queryKey: ['bank', id],
    queryFn: () => getBankDetail(id),
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['bank-questions', id],
    queryFn: () => getQuestionsForQuiz(id, true),
    enabled: tab === 'questions',
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['bank-history', id],
    queryFn: () => getUploadHistory(id),
    enabled: tab === 'history',
  });

  const { data: derivedBanks = [], isLoading: statsLoading } = useQuery({
    queryKey: ['bank-derived', id],
    queryFn: () => getDerivedBanks(id),
    enabled: tab === 'stats',
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  });

  const invalidateBank = () => {
    queryClient.invalidateQueries({ queryKey: ['bank', id] });
    queryClient.invalidateQueries({ queryKey: ['my-banks'] });
  };

  const updateTagsMutation = useMutation({
    mutationFn: (tagIds: number[]) => updateBank(id, { tagIds }),
    onSuccess: invalidateBank,
  });

  const publishMutation = useMutation({
    mutationFn: (statusId: string) => updateBank(id, { statusId }),
    onSuccess: invalidateBank,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    if (bank) {
      setTitle(bank.title);
      setDescription(bank.description ?? '');
    }
  }, [bank]);

  const updateInfoMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      updateBank(id, data),
    onSuccess: invalidateBank,
  });

  const [newTagName, setNewTagName] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const createTagMutation = useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      updateTagsMutation.mutate([
        ...(bank?.tags ?? []).map((t: Tag) => t.id),
        tag.id,
      ]);
      setNewTagName('');
    },
  });
  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) => deleteTag(tagId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });

  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(
      pageRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    );
  }, []);

  useEffect(() => {
    const socketUrl = (
      process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
    ).replace(/\/api\/?$/, '');
    const socket = io(`${socketUrl}/forum`, {
      auth: (cb: (data: { token: string }) => void) => {
        cb({ token: cookie.read('accessToken') ?? '' });
      },
    });
    socket.on('bank:reviewed', (payload: { bankId: string }) => {
      if (payload.bankId === id) {
        queryClient.invalidateQueries({ queryKey: ['bank', id] });
        queryClient.invalidateQueries({ queryKey: ['bank-derived', id] });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [id, queryClient]);

  const deleteBankMutation = useMutation({
    mutationFn: () => deleteBank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-banks'] });
      router.push('/my-banks');
    },
    onError: (e: unknown) => {
      setDeleteErr(
        e instanceof Error
          ? e.message
          : 'Xóa ngân hàng câu hỏi thất bại. Vui lòng thử lại.',
      );
    },
  });

  const handleDeleteBank = () => {
    openConfirm(
      `Delete bank "${bank?.title}"? All questions will be permanently deleted.`,
      () => deleteBankMutation.mutate(),
    );
  };

  if (bankLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-64" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">
          Question bank not found
        </h3>
        <Link
          href="/my-banks"
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/my-banks"
          className="mt-1 p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <input
            className="text-3xl font-bold text-slate-900 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-400 w-full truncate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim() && title !== bank.title)
                updateInfoMutation.mutate({ title: title.trim() });
            }}
          />
          <input
            className="text-slate-500 mt-1 bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (description !== (bank.description ?? ''))
                updateInfoMutation.mutate({ description });
            }}
            placeholder="No description"
          />
          <div className="flex flex-wrap items-center gap-2 mt-2 relative">
            {(bank.tags ?? []).map((t: Tag) => (
              <span
                key={t.id}
                className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5 font-medium"
              >
                {t.name}
                <button
                  onClick={() =>
                    updateTagsMutation.mutate(
                      (bank.tags ?? [])
                        .filter((x: Tag) => x.id !== t.id)
                        .map((x: Tag) => x.id),
                    )
                  }
                  className="hover:text-red-500 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="relative">
              <button
                onClick={() => setTagOpen((o) => !o)}
                className="text-xs text-slate-500 border border-dashed border-slate-300 rounded-full px-2.5 py-0.5 hover:border-indigo-400 hover:text-indigo-600 transition"
              >
                + Tag
              </button>
              {tagOpen && (
                <div className="absolute left-0 top-7 z-20 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1">
                  <input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Tìm tag…"
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 mb-1"
                    autoFocus
                  />
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {allTags
                      .filter((t: Tag) =>
                        t.name.toLowerCase().includes(tagSearch.toLowerCase()),
                      )
                      .map((t: Tag) => {
                        const active = (bank.tags ?? []).some(
                          (x: Tag) => x.id === t.id,
                        );
                        return (
                          <div key={t.id} className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const next = active
                                  ? (bank.tags ?? [])
                                      .filter((x: Tag) => x.id !== t.id)
                                      .map((x: Tag) => x.id)
                                  : [
                                      ...(bank.tags ?? []).map(
                                        (x: Tag) => x.id,
                                      ),
                                      t.id,
                                    ];
                                updateTagsMutation.mutate(next);
                              }}
                              className={clsx(
                                'flex-1 text-left text-xs px-2 py-1.5 rounded-lg transition',
                                active
                                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                                  : 'hover:bg-slate-50 text-slate-700',
                              )}
                            >
                              {active ? '✓ ' : ''}
                              {t.name}
                            </button>
                            <button
                              onClick={() =>
                                openConfirm(
                                  `Xóa tag "${t.name}" khỏi hệ thống?`,
                                  () => deleteTagMutation.mutate(t.id),
                                )
                              }
                              className="p-1 text-slate-300 hover:text-red-500 transition rounded shrink-0"
                              title="Xóa tag"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newTagName.trim())
                          createTagMutation.mutate(newTagName.trim());
                      }}
                      className="flex gap-1"
                    >
                      <input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Tạo tag mới…"
                        className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                      />
                      <button
                        type="submit"
                        disabled={
                          !newTagName.trim() || createTagMutation.isPending
                        }
                        className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition"
                      >
                        +
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/quiz/${id}`}>
            <Button size="md" icon={<Play className="h-4 w-4" />}>
              Start quiz
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (bank.statusId === 'draft') {
                publishMutation.mutate('pending_review');
              } else if (bank.statusId === 'pending_review') {
                publishMutation.mutate('draft');
              } else {
                publishMutation.mutate('draft');
              }
            }}
            isLoading={publishMutation.isPending}
            disabled={
              bank.statusId === 'pending_review' && publishMutation.isPending
            }
            className={
              bank.statusId === 'pending_review'
                ? 'text-amber-600 border-amber-300 hover:bg-amber-50'
                : bank.statusId === 'approved' || bank.statusId === 'published'
                  ? 'text-amber-600 border-amber-300 hover:bg-amber-50'
                  : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50'
            }
          >
            {bank.statusId === 'pending_review'
              ? 'Cancel Review'
              : bank.statusId === 'approved' || bank.statusId === 'published'
                ? 'Unpublish'
                : 'Submit for Review'}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleDeleteBank}
            isLoading={deleteBankMutation.isPending}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      {deleteErr && (
        <div className="flex items-start justify-between rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{deleteErr}</span>
          </div>
          <button
            onClick={() => setDeleteErr('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total questions', value: bank.totalQuestions },
          {
            label: 'Status',
            value:
              bank.statusId === 'pending_review'
                ? 'Pending Review'
                : bank.statusId === 'approved'
                  ? 'Approved'
                  : bank.statusId === 'published'
                    ? 'Published'
                    : 'Draft',
          },
          {
            label: 'Created',
            value: new Date(bank.createdAt).toLocaleDateString('en-US'),
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm"
          >
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {(
            [
              { key: 'questions', label: 'Questions', Icon: BookOpen },
              { key: 'upload', label: 'Import Excel', Icon: Upload },
              { key: 'history', label: 'Import History', Icon: History },
              { key: 'stats', label: 'Thống kê', Icon: BarChart2 },
            ] as { key: BankDetailTab; label: string; Icon: ElementType }[]
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition',
                tab === key
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'questions' && (
            <QuestionsTab
              questions={questions}
              isLoading={questionsLoading}
              onDeleted={() => {
                queryClient.invalidateQueries({
                  queryKey: ['bank-questions', id],
                });
                queryClient.invalidateQueries({ queryKey: ['bank', id] });
              }}
              onUpdated={() =>
                queryClient.invalidateQueries({
                  queryKey: ['bank-questions', id],
                })
              }
            />
          )}
          {tab === 'upload' && (
            <UploadTab
              bankId={id}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['bank', id] });
                queryClient.invalidateQueries({
                  queryKey: ['bank-questions', id],
                });
                queryClient.invalidateQueries({
                  queryKey: ['bank-history', id],
                });
                setTab('questions');
              }}
            />
          )}
          {tab === 'history' && (
            <HistoryTab history={history} isLoading={historyLoading} />
          )}
          {tab === 'stats' && (
            <StatsTab
              derivedBanks={derivedBanks}
              isLoading={statsLoading}
              hasFileHash={!!bank?.fileHash}
            />
          )}
        </div>
      </div>
      <RoadmapMembershipSection bankId={id} />
      {confirmModal}
    </div>
  );
}
