'use client';

import { BarChart2, Users } from 'lucide-react';
import type { DerivedBank } from '../../../../../services/quiz.service';

interface StatsTabProps {
    derivedBanks: DerivedBank[];
    isLoading: boolean;
    hasFileHash: boolean;
}

export function StatsTab({ derivedBanks, isLoading, hasFileHash }: StatsTabProps) {
    if (!hasFileHash) {
        return (
            <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <BarChart2 className="h-10 w-10 mb-3 text-slate-300" />
                <p className="font-medium">Chưa có file đính kèm</p>
                <p className="text-sm mt-1">Upload file Excel để bật tính năng theo dõi sử dụng.</p>
            </div>
        );
    }
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse bg-slate-100 rounded-xl" />)}
            </div>
        );
    }
    if (!derivedBanks.length) {
        return (
            <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <Users className="h-10 w-10 mb-3 text-slate-300" />
                <p className="font-medium">Chưa có ai dùng cùng file này</p>
            </div>
        );
    }
    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-500">{derivedBanks.length} người dùng đã upload cùng file này.</p>
            {derivedBanks.map(b => (
                <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="h-10 w-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{b.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">@{b.uploaderUsername} · {new Date(b.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
