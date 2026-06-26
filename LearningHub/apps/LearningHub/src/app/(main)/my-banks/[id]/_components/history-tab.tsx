'use client';

import { History, FileText, Clock } from 'lucide-react';
import type { UploadHistory } from '../../../../../services/quiz.service';

interface HistoryTabProps {
    history: UploadHistory[];
    isLoading: boolean;
}

export function HistoryTab({ history, isLoading }: HistoryTabProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse bg-slate-100 rounded-xl" />)}
            </div>
        );
    }
    if (!history.length) {
        return (
            <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <History className="h-10 w-10 mb-3 text-slate-300" />
                <p className="font-medium">No import history yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map(h => (
                <div key={h.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{h.fileName || 'Manual import'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(h.uploadedAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">
                        +{h.totalQuestionsImported} questions
                    </span>
                </div>
            ))}
        </div>
    );
}
