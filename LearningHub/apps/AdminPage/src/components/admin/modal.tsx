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
  children: ReactNode;
}

export function Modal({
  title,
  subtitle,
  onClose,
  wide,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-3xl p-8 w-full shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}
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
            className="p-2 hover:bg-slate-100 rounded-xl"
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
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal title="Xác nhận xóa" onClose={onCancel}>
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button className={btnSecondary} onClick={onCancel}>
          Hủy
        </button>
        <button
          className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
          onClick={onConfirm}
        >
          Xóa
        </button>
      </div>
    </Modal>
  );
}

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const openConfirm = (message: string, onConfirm: () => void) =>
    setState({ message, onConfirm });
  const modal = state ? (
    <ConfirmModal
      message={state.message}
      onConfirm={() => {
        state.onConfirm();
        setState(null);
      }}
      onCancel={() => setState(null)}
    />
  ) : null;
  return { modal, openConfirm };
}
