'use client';

import { Check } from 'lucide-react';

export function MonitoringTab() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="p-8 bg-indigo-600 text-white rounded-[40px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition duration-500" />
        <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">
          Hệ thống
        </p>
        <p className="text-4xl font-black mt-4">TRỰC TUYẾN</p>
        <div className="mt-8 flex items-center gap-2 text-indigo-200 text-sm font-bold">
          <div className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />{' '}
          Đang hoạt động ổn định
        </div>
      </div>
      <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl shadow-slate-200">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
          Lượt truy cập
        </p>
        <p className="text-4xl font-black mt-4">1,248</p>
        <div className="mt-8 text-slate-500 text-sm font-bold">
          +12% so với tháng trước
        </div>
      </div>
      <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm">
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
          Cảnh báo bảo mật
        </p>
        <p className="text-4xl font-black mt-4 text-emerald-500">0</p>
        <div className="mt-8 text-emerald-600 text-sm font-bold flex items-center gap-2">
          <Check className="h-5 w-5" /> 100% Bảo mật
        </div>
      </div>
    </div>
  );
}
