'use client';

import Link from 'next/link';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex items-center min-w-0 gap-3" href="/">
      <span className="grid w-10 h-10 text-sm font-bold text-white bg-indigo-600 rounded-xl shrink-0 place-items-center shadow-sm">
        LH
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-base font-bold truncate text-slate-900">
            LearningHub
          </span>
          <span className="block text-xs font-medium truncate text-slate-400">
            E-learning Platform
          </span>
        </span>
      ) : null}
    </Link>
  );
}
