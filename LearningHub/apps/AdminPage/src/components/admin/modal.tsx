'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { btnSecondary } from '../../lib/admin-api';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  wide?: boolean;
  extraWide?: boolean;
  children: ReactNode;
}

export function Modal({
  title,
  subtitle,
  onClose,
  wide,
  extraWide,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-3xl p-8 w-full shadow-2xl transition-all ${
          extraWide ? 'max-w-5xl' : wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'info';
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
  variant = 'danger',
}: ConfirmModalProps) {
  const title =
    variant === 'info'
      ? 'Thông báo'
      : variant === 'primary'
        ? 'Xác nhận'
        : 'Xác nhận xóa';

  const confirmClass =
    variant === 'primary'
      ? 'flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition'
      : variant === 'info'
        ? 'flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition'
        : 'flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition';

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        {cancelLabel ? (
          <button className={btnSecondary} onClick={onCancel}>
            {cancelLabel}
          </button>
        ) : null}
        <button className={confirmClass} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

interface ConfirmState {
  message: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'info';
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const openConfirm = (
    message: string,
    onConfirm?: () => void,
    opts?: {
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: 'danger' | 'primary' | 'info';
    },
  ) => setState({ message, onConfirm, ...opts });
  const modal = state ? (
    <ConfirmModal
      message={state.message}
      onConfirm={() => {
        state.onConfirm?.();
        setState(null);
      }}
      onCancel={() => setState(null)}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
    />
  ) : null;
  return { modal, openConfirm };
}
