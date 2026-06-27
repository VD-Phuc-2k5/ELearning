'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Plus } from 'lucide-react';
import type { Permission, Role, User } from '@learning-hub/domain';
import { Modal } from './modal';
import {
  getRoles,
  getPermissions,
  getUserRoles,
  getUserPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  grantUserPermission,
  revokeUserPermission,
} from '../../app/actions/admin.actions';

interface UserManagerModalProps {
  user: User;
  onClose: () => void;
}

export function UserManagerModal({ user, onClose }: UserManagerModalProps) {
  const [tab, setTab] = useState<'roles' | 'permissions'>('roles');

  const { data: allRoles = [] } = useQuery<Role[]>({
    queryKey: ['admin-roles-list'],
    queryFn: getRoles,
  });
  const { data: allPerms = [] } = useQuery<Permission[]>({
    queryKey: ['admin-perms-list'],
    queryFn: getPermissions,
  });
  const { data: userRoles, refetch: rfRoles } = useQuery<Role[]>({
    queryKey: ['user-roles', user.id],
    queryFn: () => getUserRoles(user.id),
  });
  const { data: userPerms, refetch: rfPerms } = useQuery<Permission[]>({
    queryKey: ['user-perms', user.id],
    queryFn: () => getUserPermissions(user.id),
    enabled: tab === 'permissions',
  });

  const assignedRoleIds = new Set<number>((userRoles ?? []).map((r) => r.id));
  const grantedPermIds = new Set<number>((userPerms ?? []).map((p) => p.id));

  const assignRole = useMutation({
    mutationFn: (roleId: number) => assignRoleToUser(user.id, roleId),
    onSuccess: () => rfRoles(),
  });
  const removeRole = useMutation({
    mutationFn: (roleId: number) => removeRoleFromUser(user.id, roleId),
    onSuccess: () => rfRoles(),
  });
  const grantPerm = useMutation({
    mutationFn: (permissionId: number) =>
      grantUserPermission(user.id, permissionId),
    onSuccess: () => rfPerms(),
  });
  const revokePerm = useMutation({
    mutationFn: (permissionId: number) =>
      revokeUserPermission(user.id, permissionId),
    onSuccess: () => rfPerms(),
  });

  return (
    <Modal
      title={user.username || user.email}
      subtitle={user.email}
      onClose={onClose}
      wide
    >
      <div className="flex gap-2 mb-4">
        {(['roles', 'permissions'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {k === 'roles' ? 'Vai trò' : 'Quyền trực tiếp'}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {tab === 'roles' &&
          allRoles.map((role) => {
            const on = assignedRoleIds.has(role.id);
            return (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-5 py-3.5 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {role.name}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">
                    {role.code}
                  </p>
                </div>
                <button
                  onClick={() =>
                    on ? removeRole.mutate(role.id) : assignRole.mutate(role.id)
                  }
                  disabled={assignRole.isPending || removeRole.isPending}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition ${on ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  {on ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        {tab === 'permissions' &&
          allPerms.map((perm) => {
            const on = grantedPermIds.has(perm.id);
            return (
              <div
                key={perm.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-5 py-3.5 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {perm.code}
                  </p>
                  <p className="text-xs text-slate-500">
                    {perm.resource} · {perm.action}
                  </p>
                </div>
                <button
                  onClick={() =>
                    on ? revokePerm.mutate(perm.id) : grantPerm.mutate(perm.id)
                  }
                  disabled={grantPerm.isPending || revokePerm.isPending}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition ${on ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  {on ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
      </div>
    </Modal>
  );
}
