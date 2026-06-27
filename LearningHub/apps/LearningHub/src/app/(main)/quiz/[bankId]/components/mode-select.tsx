'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  Zap,
  ClipboardList,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import '@aejkatappaja/phantom-ui';
import type { QuestionBank } from '../../../../actions/quiz.actions';
import type { Mode } from './types';

interface ModeSelectProps {
  bank: QuestionBank | undefined;
  onSelectMode: (m: Mode, timeLimitSeconds?: number) => void;
  onBack: () => void;
}

export function ModeSelect({ bank, onSelectMode, onBack }: ModeSelectProps) {
  const [timedMinutes, setTimedMinutes] = useState(30);

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <phantom-ui loading={!bank} animation="pulse" reveal={0.3}>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {bank?.title ?? 'Loading...'}
            </h2>
            <p className="text-slate-500 text-sm">
              {bank?.totalQuestions ?? 0} câu hỏi
            </p>
          </div>
        </phantom-ui>
      </div>

      {bank?.statusId !== 'published' && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Ngân hàng đang ở trạng thái <strong>draft</strong> — không thể làm
          quiz. Hãy publish trước.
        </div>
      )}

      <div
        className={clsx(
          'grid gap-4',
          bank?.statusId !== 'published' && 'pointer-events-none opacity-40',
        )}
      >
        <ModeCard
          icon={<Zap className="h-8 w-8" />}
          title="Luyện tập"
          description="Trả lời từng câu, xem kết quả ngay. Không tính điểm."
          color="bg-amber-500"
          onClick={() => onSelectMode('practice')}
        />
        <ModeCard
          icon={<ClipboardList className="h-8 w-8" />}
          title="Thi thử"
          description="Trả lời tất cả rồi nộp một lần, xem kết quả chi tiết."
          color="bg-indigo-600"
          onClick={() => onSelectMode('exam')}
        />
        <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg">
            <Clock className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Thi có tính giờ
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <label className="text-sm text-slate-500">Thời gian:</label>
              <input
                type="number"
                min={1}
                max={180}
                value={timedMinutes}
                onChange={(e) =>
                  setTimedMinutes(Math.max(1, Number(e.target.value)))
                }
                className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1 text-center focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
              />
              <span className="text-sm text-slate-500">phút</span>
            </div>
          </div>
          <button
            onClick={() => onSelectMode('timed-exam', timedMinutes * 60)}
            className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition shrink-0"
          >
            Bắt đầu
          </button>
        </div>
      </div>

      {bank?.id && (
        <Link
          href={`/my-banks/${bank.id}`}
          className="block text-center text-sm text-slate-500 hover:text-indigo-600 transition"
        >
          ← Quay lại ngân hàng câu hỏi
        </Link>
      )}
    </div>
  );
}

interface ModeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

export function ModeCard({
  icon,
  title,
  description,
  color,
  onClick,
}: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-6 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div
        className={clsx(
          'h-16 w-16 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-lg',
          color,
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
    </button>
  );
}
