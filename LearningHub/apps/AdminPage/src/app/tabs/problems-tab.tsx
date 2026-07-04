import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Terminal, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { getProblems, deleteProblem } from '../actions/problem.actions';
import { ManageTestCasesModal } from '../../components/admin/manage-test-cases-modal';
import { EditProblemModal } from '../../components/admin/edit-problem-modal';

export function ProblemsTab() {
  const qc = useQueryClient();
  const [activeProblem, setActiveProblem] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProblem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
    },
    onError: (e: any) => {
      alert(e.message || 'Xóa đề bài thất bại');
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

  const { data, isLoading } = useQuery<{ data: any[]; total: number }>({
    queryKey: ['admin-problems'],
    queryFn: getProblems,
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Dễ (Easy)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Trung bình (Medium)
          </span>
        );
      case 'hard':
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Khó (Hard)
          </span>
        );
      default:
        return null;
    }
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
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
          >
            <div className="space-y-2">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-3 w-56 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </phantom-ui>
    );

  const problems = data?.data ?? [];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {problems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-800 font-bold text-lg mb-1">
              Chưa có đề bài lập trình nào
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              Vui lòng nhấn nút "Thêm đề bài mới" ở trên để tạo đề bài đầu tiên
              cho hệ thống.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Tên đề bài
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Độ khó
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Giới hạn (Time / Memory)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Ngôn ngữ hỗ trợ
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                  Cấu hình
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {problems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">
                      {p.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getDifficultyBadge(p.difficulty)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">
                      {p.timeLimitMs} ms
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.memoryLimitMb} MB RAM
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.languages.map((l: string) => (
                        <span
                          key={l}
                          className="inline-flex text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md uppercase"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditingProblem(p)}
                      className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-slate-200 mr-2 cursor-pointer"
                      title="Sửa đề bài"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() =>
                        setActiveProblem({ id: p.id, title: p.title })
                      }
                      className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border border-indigo-100 mr-2 cursor-pointer"
                      title="Quản lý Test Cases"
                    >
                      <Terminal className="h-3.5 w-3.5" /> Test Cases
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-rose-100 cursor-pointer"
                      title="Xóa đề bài"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activeProblem && (
        <ManageTestCasesModal
          problemId={activeProblem.id}
          problemTitle={activeProblem.title}
          onClose={() => setActiveProblem(null)}
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
