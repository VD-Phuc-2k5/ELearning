'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Role } from '@learning-hub/domain';
import {
  getMatrix,
  assignPermissionToRole,
  removePermissionFromRole,
  deleteRole as deleteRoleFn,
  type MatrixData,
} from '../actions/admin.actions';

interface TogglePermissionParams {
  roleId: number;
  permId: number;
  isAssigned: boolean;
}

interface RolesTabProps {
  openConfirm: (message: string, onConfirm: () => void) => void;
  onEditRole: (role: Role) => void;
}

export function RolesTab({ openConfirm, onEditRole }: RolesTabProps) {
  const qc = useQueryClient();

  const { data: matrixData, isLoading } = useQuery<MatrixData>({
    queryKey: ['admin-matrix'],
    queryFn: getMatrix,
  });

  const togglePermission = useMutation({
    mutationFn: ({ roleId, permId, isAssigned }: TogglePermissionParams) =>
      isAssigned
        ? removePermissionFromRole(roleId, permId)
        : assignPermissionToRole(roleId, permId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-matrix'] }),
  });

  const deleteRole = useMutation({
    mutationFn: deleteRoleFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-matrix'] }),
  });

  if (isLoading)
    return (
      <phantom-ui loading animation="pulse" reveal={0.3} className="block p-6">
        <div className="flex gap-3 border-b border-slate-100 pb-4 mb-3">
          <div className="w-64 h-10 rounded-lg bg-slate-200 shrink-0" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 flex-1 rounded-lg bg-slate-200" />
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 items-center py-2">
            <div className="w-64 h-4 rounded bg-slate-100 shrink-0" />
            {[0, 1, 2, 3].map((j) => (
              <div
                key={j}
                className="h-8 w-8 rounded-xl bg-slate-100 mx-auto flex-1 max-w-[32px]"
              />
            ))}
          </div>
        ))}
      </phantom-ui>
    );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-center">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase border-r border-slate-200 sticky left-0 bg-slate-50 z-10 w-64">
              Quyền hạn
            </th>
            {matrixData?.roles?.map((role) => (
              <th
                key={role.id}
                className="px-6 py-4 group border-r border-slate-200 min-w-[120px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    {role.code}
                  </span>
                  <p className="text-[10px] text-slate-500 font-normal">
                    {role.name}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEditRole(role)}
                      className="p-1 hover:text-indigo-600 transition rounded"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() =>
                        openConfirm(`Xóa vai trò "${role.code}"?`, () =>
                          deleteRole.mutate(role.id),
                        )
                      }
                      className="p-1 hover:text-rose-600 transition rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {matrixData?.permissions?.map((perm) => (
            <tr key={perm.id} className="hover:bg-slate-50/50 transition">
              <td className="px-6 py-4 text-left text-sm font-bold text-slate-700 bg-slate-50/30 border-r border-slate-200 sticky left-0 z-10">
                {perm.code}
              </td>
              {matrixData.roles.map((role) => {
                const isAssigned = matrixData.matrix[role.id]?.includes(
                  perm.id,
                );
                return (
                  <td
                    key={`${role.id}-${perm.id}`}
                    className="px-6 py-4 border-r border-slate-100"
                  >
                    <button
                      onClick={() =>
                        togglePermission.mutate({
                          roleId: role.id,
                          permId: perm.id,
                          isAssigned: !!isAssigned,
                        })
                      }
                      disabled={togglePermission.isPending}
                      className={`mx-auto h-8 w-8 rounded-xl flex items-center justify-center transition-all ${isAssigned ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                    >
                      {isAssigned ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
