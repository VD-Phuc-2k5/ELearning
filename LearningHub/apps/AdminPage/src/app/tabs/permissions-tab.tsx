'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import type { Permission } from '@learning-hub/domain';
import {
  getPermissions,
  deletePermission as deletePermissionFn,
} from '../actions/admin.actions';

interface PermissionsTabProps {
  openConfirm: (message: string, onConfirm: () => void) => void;
}

export function PermissionsTab({ openConfirm }: PermissionsTabProps) {
  const qc = useQueryClient();

  const { data: perms, isLoading } = useQuery<Permission[]>({
    queryKey: ['admin-permissions'],
    queryFn: getPermissions,
  });

  const deletePermission = useMutation({
    mutationFn: deletePermissionFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-permissions'] }),
  });

  if (isLoading)
    return (
      <phantom-ui loading animation="pulse" reveal={0.3} className="block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="h-5 w-16 rounded-lg bg-slate-100 mb-4" />
              <div className="h-6 w-24 rounded-lg bg-slate-200 mb-1" />
              <div className="h-4 w-32 rounded bg-slate-100 mt-0.5" />
              <div className="h-3 w-24 rounded bg-slate-100 mt-0.5" />
            </div>
          ))}
        </div>
      </phantom-ui>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(perms ?? []).map((p: Permission) => (
        <div
          key={p.id}
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition relative"
        >
          <button
            onClick={() =>
              openConfirm(`Xóa quyền "${p.code}"?`, () =>
                deletePermission.mutate(p.id),
              )
            }
            disabled={deletePermission.isPending}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter inline-block mb-4">
            {p.resource}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">
            {p.action?.toUpperCase()}
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            {p.name || p.code}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{p.code}</p>
        </div>
      ))}
    </div>
  );
}
