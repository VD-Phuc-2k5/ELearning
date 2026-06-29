'use client';

import type { ReactNode } from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

export function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10 font-black scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-indigo-100'}`}
    >
      {icon}
      <span className="text-sm tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />
      )}
    </button>
  );
}
