'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import type { ReactionGroup } from '@learning-hub/domain';
import { ReactionPicker } from './reaction-picker';

interface ReactionBarProps {
  reactions: ReactionGroup[];
  onReact: (emoji: string) => void;
  disabled?: boolean;
}

export function ReactionBar({
  reactions,
  onReact,
  disabled,
}: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      {reactions
        .filter((r) => r.count > 0)
        .map((r) => (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onReact(r.emoji)}
            disabled={disabled}
            title={r.reacted ? 'Click to remove' : 'Click to react'}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
              r.reacted
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            } disabled:opacity-40`}
          >
            <span className="leading-none">{r.emoji}</span>
            <span className="font-medium tabular-nums">{r.count}</span>
          </button>
        ))}
      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          disabled={disabled}
          className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-400 transition hover:border-slate-400 hover:text-slate-600 disabled:opacity-40"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>
        {pickerOpen && (
          <ReactionPicker
            onSelect={onReact}
            onClose={() => setPickerOpen(false)}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
