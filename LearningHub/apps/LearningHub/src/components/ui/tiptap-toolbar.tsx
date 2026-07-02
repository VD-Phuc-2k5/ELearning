'use client';

import type { Editor } from '@tiptap/react';
import {
  getFullToolbarButtons,
  getBubbleToolbarButtons,
} from './tiptap-toolbar-buttons';

interface TiptapToolbarProps {
  editor: Editor;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrike: () => void;
  onTriggerFilePicker: () => void;
  onOpenLink: () => void;
  bubble?: boolean;
}

export function TiptapToolbar({
  editor,
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onTriggerFilePicker,
  onOpenLink,
  bubble,
}: TiptapToolbarProps) {
  const buttons = bubble
    ? getBubbleToolbarButtons(onBold, onItalic, onUnderline, onStrike)
    : getFullToolbarButtons(
        onBold,
        onItalic,
        onUnderline,
        onStrike,
        onOpenLink,
        onTriggerFilePicker,
      );

  return (
    <div className="overflow-x-auto">
      <div className="flex w-max items-center gap-0.5 whitespace-nowrap px-2 py-1.5">
        {buttons.map((item, i) =>
          item === 'divider' ? (
            <div key={i} className="mx-1 h-6 w-px shrink-0 bg-slate-200" />
          ) : (
            <ToolbarButton
              key={i}
              icon={item.icon}
              title={item.title}
              onClick={() => item.onClick(editor)}
              active={item.isActive(editor)}
              disabled={item.disabled?.(editor) ?? false}
            />
          ),
        )}
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  icon,
  title,
  onClick,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        'h-8 w-8 shrink-0 rounded-lg inline-flex items-center justify-center transition',
        disabled
          ? 'opacity-30 cursor-not-allowed text-slate-400'
          : active
            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}
