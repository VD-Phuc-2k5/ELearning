import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Terminal,
  BookOpen,
  Edit3,
  Trash2,
  FileText,
  Clock,
  Cpu,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getProblems,
  deleteProblem,
  toggleProblemStatus,
} from '../actions/problem.actions';
import { ManageTestCasesModal } from '../../components/admin/manage-test-cases-modal';
import { EditProblemModal } from '../../components/admin/edit-problem-modal';

interface ProblemItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMs: number;
  memoryLimitMb: number;
  languages: string[];
  status?: 'draft' | 'public';
  testCaseCount?: number;
  templates?: Record<string, string>;
  wrappers?: Record<string, string>;
}

export function ProblemsTab() {
  const qc = useQueryClient();
  const [activeProblem, setActiveProblem] = useState<{
    id: string;
    title: string;
    status: 'draft' | 'public';
  } | null>(null);
  const [editingProblem, setEditingProblem] = useState<ProblemItem | null>(
    null,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProblem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
    },
    onError: (e: Error) => {
      alert(e.message || 'Xóa đề bài thất bại');
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'public' }) =>
      toggleProblemStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
    },
    onError: (e: Error) => {
      alert(e.message || 'Cập nhật trạng thái thất bại');
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (
      confirm(
        `Bạn chắc chắn muốn xóa đề bài "${title}"? Tất cả test cases và lịch sử nộp bài cũng sẽ bị xóa vĩnh viễn.`,
      )
    ) {
      deleteMut.mutate(id);
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery<{
    data: ProblemItem[];
    total: number;
  }>({
    queryKey: ['admin-problems'],
    queryFn: getProblems,
  });

  const difficultyConfig = {
    easy: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      label: 'Dễ',
    },
    medium: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      label: 'Trung bình',
    },
    hard: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      label: 'Khó',
    },
  };

  if (isLoading)
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.3}
        className="block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="h-12 bg-slate-50 border-b border-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-slate-50/50 p-6 animate-pulse space-y-4 border border-slate-100"
            >
              <div className="flex justify-between">
                <div className="h-5 w-16 rounded-full bg-slate-200" />
                <div className="h-5 w-12 rounded-full bg-slate-200" />
              </div>
              <div className="h-6 w-3/4 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
              </div>
              <div className="flex gap-2 pt-4">
                <div className="h-8 w-16 rounded-xl bg-slate-200" />
                <div className="h-8 w-20 rounded-xl bg-slate-200" />
                <div className="h-8 w-12 rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </phantom-ui>
    );

  const problems = data?.data ?? [];

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="text-center py-16 px-4">
          <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-slate-800 font-bold text-lg mb-1">
            Không thể tải danh sách đề bài
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            {error instanceof Error
              ? error.message
              : 'Lỗi không xác định khi tải dữ liệu từ máy chủ.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {problems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="text-center py-16 px-4">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-800 font-bold text-lg mb-1">
              Chưa có đề bài lập trình nào
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              Vui lòng nhấn nút "Thêm đề bài" ở trên để tạo đề bài đầu tiên cho
              hệ thống.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {problems.map((p: ProblemItem) => {
            const diff = difficultyConfig[p.difficulty];
            const isExpanded = expandedId === p.id;

            return (
              <div
                key={p.id}
                className="group bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 rounded-3xl p-6 transition flex flex-col"
              >
                {/* Header: status + difficulty */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      p.status === 'public'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}
                  >
                    {p.status === 'public' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Công khai
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" /> Bản nháp
                      </>
                    )}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}
                  >
                    {diff.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">
                  {p.title}
                </h3>

                {/* Description preview */}
                <div className="prose prose-sm max-w-none text-slate-500 text-xs line-clamp-3 mb-2 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {p.description || ''}
                  </ReactMarkdown>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition mb-3 cursor-pointer self-start"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {isExpanded ? 'Ẩn mô tả' : 'Xem mô tả'}
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Expanded full description */}
                {isExpanded && (
                  <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-[300px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {p.description || ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-3 text-[11px] font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {p.timeLimitMs}ms
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-slate-400" />
                    {p.memoryLimitMb}MB
                  </span>
                  {p.testCaseCount !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5 text-slate-400" />
                      {p.testCaseCount} test{p.testCaseCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Language tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {p.languages.map((l: string) => (
                    <span
                      key={l}
                      className="inline-flex text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md uppercase border border-indigo-100"
                    >
                      {l}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setEditingProblem(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Sửa
                  </button>
                  <button
                    onClick={() =>
                      setActiveProblem({
                        id: p.id,
                        title: p.title,
                        status: p.status || 'draft',
                      })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Terminal className="h-3.5 w-3.5" /> Tests
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 bg-white text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl text-xs font-bold transition border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() =>
                    toggleStatusMut.mutate({
                      id: p.id,
                      status: p.status === 'public' ? 'draft' : 'public',
                    })
                  }
                  disabled={toggleStatusMut.isPending}
                  className={`mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer disabled:opacity-60 ${
                    p.status === 'public'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {p.status === 'public'
                    ? 'Đưa về bản nháp'
                    : 'Công khai đề bài'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeProblem && (
        <ManageTestCasesModal
          problemId={activeProblem.id}
          problemTitle={activeProblem.title}
          problemStatus={activeProblem.status}
          onClose={() => {
            setActiveProblem(null);
            qc.invalidateQueries({ queryKey: ['admin-problems'] });
          }}
        />
      )}

      {editingProblem && (
        <EditProblemModal
          problem={editingProblem}
          onClose={() => setEditingProblem(null)}
        />
      )}
    </>
  );
}
