'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from './modal';
import {
  inputCls,
  btnPrimary,
  btnSecondary,
  getAxiosMessage,
} from '../../lib/admin-api';
import { registerAdmin } from '../../app/actions/admin.actions';

interface CreateAdminModalProps {
  onClose: () => void;
}

interface AdminField {
  key: keyof typeof defaultForm;
  label: string;
  type: string;
  ph: string;
}

const defaultForm = { username: '', email: '', password: '' };

const fields: AdminField[] = [
  { key: 'username', label: 'Tên hiển thị', type: 'text', ph: 'Nguyễn Văn A' },
  { key: 'email', label: 'Email', type: 'email', ph: 'admin2@example.com' },
  { key: 'password', label: 'Mật khẩu', type: 'password', ph: 'Admin123@' },
];

export function CreateAdminModal({ onClose }: CreateAdminModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const [err, setErr] = useState('');
  const [showPw, setShowPw] = useState(false);

  const mut = useMutation({
    mutationFn: () => registerAdmin(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Tạo tài khoản thất bại')),
  });

  return (
    <Modal title="Tạo tài khoản Admin" onClose={onClose}>
      <div className="space-y-4">
        {fields.map(({ key, label, type, ph }) => {
          const isPw = key === 'password';
          const effectiveType = isPw ? (showPw ? 'text' : 'password') : type;
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
              </label>
              <div className="relative">
                <input
                  type={effectiveType}
                  value={form[key]}
                  placeholder={ph}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className={inputCls}
                />
                {isPw && (
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {err && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {err}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={btnSecondary}>
            Hủy
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className={btnPrimary}
          >
            {mut.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
