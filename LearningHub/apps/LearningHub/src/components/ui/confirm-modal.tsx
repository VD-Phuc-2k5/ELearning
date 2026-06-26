'use client';

import { useState } from 'react';
import { Button } from './button';

type ConfirmState = { message: string; onConfirm: () => void } | null;

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-slate-800 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>Hủy</Button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center h-9 px-3 text-sm rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState>(null);

  const openConfirm = (message: string, onConfirm: () => void) => {
    setState({ message, onConfirm });
  };

  const modal = state ? (
    <ConfirmModal
      message={state.message}
      onConfirm={() => { state.onConfirm(); setState(null); }}
      onCancel={() => setState(null)}
    />
  ) : null;

  return { modal, openConfirm };
}
