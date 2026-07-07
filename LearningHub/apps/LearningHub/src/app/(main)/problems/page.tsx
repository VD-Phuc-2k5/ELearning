'use client';

import { useQuery } from '@tanstack/react-query';
import { getStudentProblems } from '../../actions/problem.actions';
import { Code2, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ProblemItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimitMs: number;
  languages: string[];
}

export default function ProblemsPage() {
  const { data, isLoading, error } = useQuery<{
    data: ProblemItem[];
    total: number;
  }>({
    queryKey: ['student-problems'],
    queryFn: getStudentProblems,
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-100">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-100">
            Hard
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 border border-slate-100 rounded-3xl bg-slate-50/50 p-6 animate-pulse space-y-4"
            >
              <div className="h-6 w-32 rounded bg-slate-200" />
              <div className="h-4 w-48 rounded bg-slate-100" />
              <div className="h-10 w-full rounded bg-slate-200 pt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4 border border-slate-200 rounded-3xl bg-white max-w-lg mx-auto">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-slate-800 font-bold text-lg mb-1">
          Lỗi tải danh sách bài tập
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          {error.message ||
            'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'}
        </p>
      </div>
    );
  }

  const problems = data?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Coding Challenge Hub
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Rèn luyện kỹ năng lập trình của bạn với các bài tập thực hành thuật
          toán tự động chấm điểm.
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <Code2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-800 font-bold text-lg mb-1">
            Hệ thống chưa có bài tập nào
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Vui lòng liên hệ Admin/Giáo viên để thêm các bài tập lập trình mới
            lên diễn đàn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p: ProblemItem) => (
            <div
              key={p.id}
              className="group bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 rounded-3xl p-6 transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  {getDifficultyBadge(p.difficulty)}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {p.timeLimitMs}ms
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-lg">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {p.languages.map((l: string) => (
                    <span
                      key={l}
                      className="inline-flex text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/problems/${p.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-sm py-3 px-4 rounded-2xl hover:bg-indigo-700 transition shadow-sm"
                >
                  Giải Bài Tập <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
