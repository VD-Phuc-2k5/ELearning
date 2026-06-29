'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './modal';
import {
  inputCls,
  btnPrimary,
  btnSecondary,
  getAxiosMessage,
} from '../../lib/admin-api';
import { createRole } from '../../app/actions/admin.actions';

interface AddRoleModalProps {
  onClose: () => void;
}

export function AddRoleModal({ onClose }: AddRoleModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: () => createRole(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matrix'] });
      onClose();
    },
    onError: (e: unknown) => setErr(getAxiosMessage(e, 'Tạo vai trò thất bại')),
  });

  return (
    <Modal title="Thêm vai trò mới" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mã vai trò (CODE)
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) =>
              setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
            }
            placeholder="VD: INSTRUCTOR"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên vai trò
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="VD: Giảng viên"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mô tả (tùy chọn)
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Mô tả vai trò..."
            className={inputCls}
          />
        </div>
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
            disabled={mut.isPending || !form.code || !form.name}
            className={btnPrimary}
          >
            {mut.isPending ? 'Đang tạo...' : 'Tạo vai trò'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
