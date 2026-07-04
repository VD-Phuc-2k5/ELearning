'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

type ConfirmState = {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
} | null;

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
  variant = 'danger',
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}) {
  const confirmClass =
    variant === 'primary'
      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
      : 'bg-red-600 text-white hover:bg-red-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-slate-800 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            className={`inline-flex items-center h-9 px-3 text-sm rounded-md font-medium transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState>(null);

  const openConfirm = (
    message: string,
    onConfirm: () => void,
    opts?: {
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: 'danger' | 'primary';
      onCancel?: () => void;
    },
  ) => {
    setState({ message, onConfirm, ...opts });
  };

  const modal = state
    ? createPortal(
        <ConfirmModal
          message={state.message}
          onConfirm={() => {
            state.onConfirm();
            setState(null);
          }}
          onCancel={() => {
            state.onCancel?.();
            setState(null);
          }}
          confirmLabel={state.confirmLabel}
          cancelLabel={state.cancelLabel}
          variant={state.variant}
        />,
        document.body,
      )
    : null;

  return { modal, openConfirm };
}
