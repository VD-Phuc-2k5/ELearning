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
    <div className="absolute z-50 bottom-full bg-white grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200 p-2 shadow-xl w-[200px]">
      {ALL_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          disabled={disabled}
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
  );
}
