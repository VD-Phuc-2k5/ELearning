'use client';

import type { RefObject } from 'react';
import { Globe, Lock, ChevronDown } from 'lucide-react';

const VISIBILITY_LABEL: Record<string, string> = {
  public: 'Public',
  private: 'Private',
};

const VISIBILITY_ICON: Record<string, React.ReactNode> = {
  public: <Globe className="h-3 w-3" />,
  private: <Lock className="h-3 w-3" />,
};

interface ForumVisibilityControlProps {
  currentVis: string;
  isOwner: boolean;
  showDropdown: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onChange: (vis: 'public' | 'private') => void;
  isPending: boolean;
}

export function ForumVisibilityControl({
  currentVis,
  isOwner,
  showDropdown,
  dropdownRef,
  onToggle,
  onChange,
  isPending,
}: ForumVisibilityControlProps) {
  if (!isOwner) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 capitalize shrink-0">
        {VISIBILITY_ICON[currentVis] ?? VISIBILITY_ICON.public}
        {VISIBILITY_LABEL[currentVis] ?? currentVis}
      </span>
    );
  }

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 capitalize hover:bg-slate-200 transition"
      >
        {VISIBILITY_ICON[currentVis] ?? VISIBILITY_ICON.public}
        {VISIBILITY_LABEL[currentVis] ?? currentVis}
        <ChevronDown className="h-3 w-3" />
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1 min-w-[120px]">
          {(['public', 'private'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              disabled={isPending}
              className={[
                'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition',
                currentVis === v
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {VISIBILITY_ICON[v]}
              {VISIBILITY_LABEL[v]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
