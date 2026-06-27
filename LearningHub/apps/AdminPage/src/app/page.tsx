'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Key,
  Activity,
  Plus,
  Trash2,
  Settings,
  Edit3,
  Check,
} from 'lucide-react';
import '@aejkatappaja/phantom-ui';
import type { Permission, Role, User } from '@learning-hub/domain';
import { api } from '../lib/admin-api';
import { useConfirmModal } from '../components/admin/modal';
import { LoginScreen } from '../components/admin/login-screen';
import { TabButton } from '../components/admin/tab-button';
import { CreateAdminModal } from '../components/admin/create-admin-modal';
import { AddPermissionModal } from '../components/admin/add-permission-modal';
import { AddRoleModal } from '../components/admin/add-role-modal';
import { EditRoleModal } from '../components/admin/edit-role-modal';
import { UserManagerModal } from '../components/admin/user-manager-modal';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'users' | 'roles' | 'permissions'
  >('users');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { modal: confirmModal, openConfirm } = useConfirmModal();

  useEffect(() => {
    setToken(localStorage.getItem('adminToken'));
  }, []);

  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () =>
      api.get<User[]>('/api/admin/users?role=ADMIN').then((r) => r.data),
    enabled: !!token && activeTab === 'users',
  });

  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ['admin-matrix'],
    queryFn: async () => {
      const [{ data: roles }, { data: perms }] = await Promise.all([
        api.get<Role[]>('/api/admin/roles'),
        api.get<Permission[]>('/api/admin/permissions'),
      ]);
      const rolePerms = await Promise.all(
        roles.map((r) =>
          api
            .get<Permission[]>(`/api/admin/roles/${r.id}/permissions`)
            .then((res) => ({
              id: r.id,
              permIds: res.data.map((p) => p.id),
            })),
        ),
      );
      const matrix: Record<number, number[]> = {};
      rolePerms.forEach(({ id, permIds }) => {
        matrix[id] = permIds;
      });
      return { roles, permissions: perms, matrix };
    },
    enabled: !!token && activeTab === 'roles',
  });

  const { data: permsData, isLoading: permsLoading } = useQuery<Permission[]>({
    queryKey: ['admin-permissions'],
    queryFn: () =>
      api.get<Permission[]>('/api/admin/permissions').then((r) => r.data),
    enabled: !!token && activeTab === 'permissions',
  });

  interface TogglePermissionParams {
    roleId: number;
    permId: number;
    isAssigned: boolean;
  }
  const togglePermission = useMutation({
    mutationFn: ({ roleId, permId, isAssigned }: TogglePermissionParams) =>
      isAssigned
        ? api.delete(`/api/admin/roles/${roleId}/permissions/${permId}`)
        : api.post(`/api/admin/roles/${roleId}/permissions`, {
            permissionId: permId,
          }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-matrix'] }),
  });

  const deleteRole = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/roles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-matrix'] }),
  });

  const deletePermission = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/permissions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-permissions'] }),
  });

  if (token === null)
    return (
      <LoginScreen
        onLogin={() => setToken(localStorage.getItem('adminToken'))}
      />
    );

  const tabTitle: Record<string, string> = {
    users: 'Quản lý Thành viên',
    roles: 'Ma trận Vai trò & Quyền',
    permissions: 'Danh mục Quyền hạn',
    monitoring: 'Giám sát Hệ thống',
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-400" /> Cổng Quản Trị
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users className="h-5 w-5" />}
            label="Thành viên"
          />
          <TabButton
            active={activeTab === 'roles'}
            onClick={() => setActiveTab('roles')}
            icon={<Settings className="h-5 w-5" />}
            label="Vai trò & Quyền"
          />
          <TabButton
            active={activeTab === 'permissions'}
            onClick={() => setActiveTab('permissions')}
            icon={<Key className="h-5 w-5" />}
            label="Danh mục Quyền"
          />
          <TabButton
            active={activeTab === 'monitoring'}
            onClick={() => setActiveTab('monitoring')}
            icon={<Activity className="h-5 w-5" />}
            label="Giám sát"
          />
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              setToken(null);
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {tabTitle[activeTab]}
          </h2>
          <div className="flex gap-2">
            {activeTab === 'users' && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                <Plus className="h-5 w-5" /> Thêm Admin
              </button>
            )}
            {activeTab === 'permissions' && (
              <button
                onClick={() => setShowCreatePerm(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                <Plus className="h-5 w-5" /> Thêm quyền
              </button>
            )}
            {activeTab === 'roles' && (
              <button
                onClick={() => setShowCreateRole(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                <Plus className="h-5 w-5" /> Thêm vai trò
              </button>
            )}
          </div>
        </header>

        {showCreate && (
          <CreateAdminModal onClose={() => setShowCreate(false)} />
        )}
        {selectedUser && (
          <UserManagerModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
        {showCreatePerm && (
          <AddPermissionModal onClose={() => setShowCreatePerm(false)} />
        )}
        {showCreateRole && (
          <AddRoleModal onClose={() => setShowCreateRole(false)} />
        )}
        {editingRole && (
          <EditRoleModal
            role={editingRole}
            onClose={() => setEditingRole(null)}
          />
        )}

        {activeTab === 'users' &&
          (usersLoading ? (
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
          ) : (
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
                  {(usersData ?? []).map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {u.username || '—'}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Settings className="h-4 w-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {activeTab === 'roles' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            {matrixLoading ? (
              <phantom-ui
                loading
                animation="pulse"
                reveal={0.3}
                className="block p-6"
              >
                <div className="flex gap-3 border-b border-slate-100 pb-4 mb-3">
                  <div className="w-64 h-10 rounded-lg bg-slate-200 shrink-0" />
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 flex-1 rounded-lg bg-slate-200"
                    />
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
            ) : (
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
                              onClick={() => setEditingRole(role)}
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
                    <tr
                      key={perm.id}
                      className="hover:bg-slate-50/50 transition"
                    >
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
            )}
          </div>
        )}

        {activeTab === 'permissions' &&
          (permsLoading ? (
            <phantom-ui
              loading
              animation="pulse"
              reveal={0.3}
              className="block"
            >
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(permsData ?? []).map((p) => (
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
          ))}

        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="p-8 bg-indigo-600 text-white rounded-[40px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition duration-500" />
              <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">
                Hệ thống
              </p>
              <p className="text-4xl font-black mt-4">TRỰC TUYẾN</p>
              <div className="mt-8 flex items-center gap-2 text-indigo-200 text-sm font-bold">
                <div className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />{' '}
                Đang hoạt động ổn định
              </div>
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl shadow-slate-200">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                Lượt truy cập
              </p>
              <p className="text-4xl font-black mt-4">1,248</p>
              <div className="mt-8 text-slate-500 text-sm font-bold">
                +12% so với tháng trước
              </div>
            </div>
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                Cảnh báo bảo mật
              </p>
              <p className="text-4xl font-black mt-4 text-emerald-500">0</p>
              <div className="mt-8 text-emerald-600 text-sm font-bold flex items-center gap-2">
                <Check className="h-5 w-5" /> 100% Bảo mật
              </div>
            </div>
          </div>
        )}
      </main>
      {confirmModal}
    </div>
  );
}
