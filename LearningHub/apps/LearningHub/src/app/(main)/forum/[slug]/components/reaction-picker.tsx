'use client';

import { X } from 'lucide-react';

const ALL_EMOJIS = [
  '👍',
  '👎',
  '❤️',
  '🎉',
  '🔥',
  '💯',
  '👀',
  '😮',
  '😢',
  '😡',
  '🤔',
  '🙌',
  '👍🏻',
  '👏',
  '🚀',
  '💡',
  '✅',
  '❌',
  '☕',
  '🤝',
];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function ReactionPicker({
  onSelect,
  onClose,
  disabled,
}: ReactionPickerProps) {
  return (
    <div className="absolute bottom-full left-0 mb-2 z-50">
      <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
        {ALL_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            disabled={disabled}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-lg transition-all hover:scale-125 hover:bg-slate-100 active:scale-95 disabled:opacity-40"
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-xs text-slate-400 hover:bg-slate-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
