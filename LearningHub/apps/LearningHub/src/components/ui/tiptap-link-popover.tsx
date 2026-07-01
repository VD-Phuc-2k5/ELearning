'use client';

import type { RefObject } from 'react';
import { X } from 'lucide-react';

interface TiptapLinkPopoverProps {
  open: boolean;
  url: string;
  hasExistingLink: boolean;
  error: boolean;
  boxRef: RefObject<HTMLDivElement | null>;
  onUrlChange: (v: string) => void;
  onApply: () => void;
  onRemoveLink: () => void;
  onCancel: () => void;
}

export function TiptapLinkPopover({
  open,
  url,
  hasExistingLink,
  error,
  boxRef,
  onUrlChange,
  onApply,
  onRemoveLink,
  onCancel,
}: TiptapLinkPopoverProps) {
  if (!open) return null;

  return (
    <div
      ref={boxRef}
      className="relative z-30 border-b border-slate-200 px-4 py-2"
    >
      <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-2">
        <input
          autoFocus
          type="text"
          value={url}
          onChange={(e) => {
            onUrlChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onApply();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="https://example.com"
          className={[
            'h-9 flex-1 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={onApply}
          className="h-9 shrink-0 rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white hover:bg-indigo-700 transition"
        >
          Apply
        </button>
        {hasExistingLink && (
          <button
            type="button"
            onClick={onRemoveLink}
            title="Remove link"
            className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 transition inline-flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500 hover:text-slate-700 transition"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="mt-1 px-1 text-xs text-rose-600">
          Please enter a valid URL.
        </p>
      )}
    </div>
  );
}
