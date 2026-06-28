'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Edit3, Trash2 } from 'lucide-react';
import type { User } from '@learning-hub/domain';
import { deleteAdmin, getUsers } from '../actions/admin.actions';

interface UsersTabProps {
  onSelectUser: (user: User) => void;
  onEditUser: (user: User) => void;
  openConfirm: (message: string, onConfirm: () => void) => void;
}

export function UsersTab({
  onSelectUser,
  onEditUser,
  openConfirm,
}: UsersTabProps) {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: getUsers,
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading)
    return (
      <phantom-ui
        loading
        animation="pulse"
        reveal={0.3}
        className="block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="h-12 bg-slate-50 border-b border-slate-200" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
          >
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-3 w-44 rounded bg-slate-100" />
            </div>
            <div className="h-4 w-4 rounded bg-slate-200" />
          </div>
        ))}
      </phantom-ui>
    );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              Thành viên
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
              Quản lý
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(users ?? []).map((u) => (
            <tr
              key={u.id}
              className="hover:bg-slate-50 transition cursor-pointer"
            >
              <td className="px-6 py-4" onClick={() => onSelectUser(u)}>
                <div className="font-bold text-slate-900">
                  {u.username || '—'}
                </div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditUser(u)}
                    className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Sửa"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      openConfirm(
                        `Xóa tài khoản "${u.username || u.email}"?`,
                        () => removeMut.mutate(u.id),
                      )
                    }
                    className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onSelectUser(u)}
                    className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Phân quyền"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
