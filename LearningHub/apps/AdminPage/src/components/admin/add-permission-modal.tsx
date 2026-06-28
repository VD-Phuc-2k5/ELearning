'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from './modal';
import {
  VALID_ACTIONS,
  inputCls,
  btnPrimary,
  btnSecondary,
  getAxiosMessage,
} from '../../lib/admin-api';
import {
  getResources,
  createPermission,
} from '../../app/actions/admin.actions';

interface AddPermissionModalProps {
  onClose: () => void;
}

interface PermissionForm {
  resource: string;
  action: (typeof VALID_ACTIONS)[number];
  name: string;
}

export function AddPermissionModal({ onClose }: AddPermissionModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<PermissionForm>({
    resource: '',
    action: 'create',
    name: '',
  });
  const [err, setErr] = useState('');

  const { data: resources } = useQuery<string[]>({
    queryKey: ['perm-resources'],
    queryFn: getResources,
  });

  const mut = useMutation({
    mutationFn: () => createPermission(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      onClose();
    },
    onError: (e: unknown) => setErr(getAxiosMessage(e, 'Tạo quyền thất bại')),
  });

  return (
    <Modal title="Thêm quyền mới" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resource
          </label>
          <select
            value={form.resource}
            onChange={(e) =>
              setForm((p) => ({ ...p, resource: e.target.value }))
            }
            className={inputCls}
          >
            <option value="">-- Chọn resource --</option>
            {(resources ?? []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Action
          </label>
          <select
            value={form.action}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                action: e.target.value as (typeof VALID_ACTIONS)[number],
              }))
            }
            className={inputCls}
          >
            {VALID_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên quyền
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ví dụ: Xem danh sách roles"
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
            disabled={mut.isPending || !form.resource || !form.name}
            className={btnPrimary}
          >
            {mut.isPending ? 'Đang tạo...' : 'Tạo quyền'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
