'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Role } from '@learning-hub/domain';
import { Modal } from './modal';
import {
  inputCls,
  btnPrimary,
  btnSecondary,
  getAxiosMessage,
} from '../../lib/admin-api';
import { updateRole } from '../../app/actions/admin.actions';

interface EditRoleModalProps {
  role: Role;
  onClose: () => void;
}

export function EditRoleModal({ role, onClose }: EditRoleModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: role.name ?? '',
    description: role.description ?? '',
  });
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: () => updateRole(role.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matrix'] });
      onClose();
    },
    onError: (e: unknown) => setErr(getAxiosMessage(e, 'Cập nhật thất bại')),
  });

  return (
    <Modal title={`Sửa vai trò: ${role.code}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên vai trò
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mô tả
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
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
            disabled={mut.isPending || !form.name}
            className={btnPrimary}
          >
            {mut.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
