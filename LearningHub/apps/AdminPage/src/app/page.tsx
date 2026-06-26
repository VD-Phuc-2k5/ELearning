'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Key,
  Activity,
  Check,
  Plus,
  Trash2,
  Settings,
  X,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';

const api = axios.create();
api.interceptors.request.use((c) => {
  const t =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  if (t && c.headers) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const VALID_ACTIONS = ['create', 'get', 'update', 'delete'] as const;

// ─── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const { data } = await axios.post('/api/auth/admin/login', {
        email,
        password,
      });
      localStorage.setItem('adminToken', data.accessToken);
      onLogin();
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Cổng Quản Trị</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
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
            </div>
          </div>
          {err && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Shell ───────────────────────────────────────────────────────────────
function Modal({
  title,
  subtitle,
  onClose,
  wide,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
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

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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

function useConfirmModal() {
  const [state, setState] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
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

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none';
const btnPrimary =
  'flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60';
const btnSecondary =
  'flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50';

// ─── Create Admin Modal ────────────────────────────────────────────────────────
function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: () => api.post('/api/auth/admin/register', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
    onError: (e: any) =>
      setErr(e.response?.data?.message || 'Tạo tài khoản thất bại'),
  });

  const fields: {
    key: keyof typeof form;
    label: string;
    type: string;
    ph: string;
  }[] = [
    {
      key: 'username',
      label: 'Tên hiển thị',
      type: 'text',
      ph: 'Nguyễn Văn A',
    },
    { key: 'email', label: 'Email', type: 'email', ph: 'admin2@example.com' },
    { key: 'password', label: 'Mật khẩu', type: 'password', ph: 'Admin123@' },
  ];

  return (
    <Modal title="Tạo tài khoản Admin" onClose={onClose}>
      <div className="space-y-4">
        {fields.map(({ key, label, type, ph }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              placeholder={ph}
              onChange={(e) =>
                setForm((p) => ({ ...p, [key]: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        ))}
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

// ─── Add Permission Modal ──────────────────────────────────────────────────────
function AddPermissionModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    resource: '',
    action: 'create' as (typeof VALID_ACTIONS)[number],
    name: '',
  });
  const [err, setErr] = useState('');

  const { data: resourcesData } = useQuery<{ resources: string[] }>({
    queryKey: ['perm-resources'],
    queryFn: () =>
      api.get('/api/admin/permissions/resources').then((r) => r.data),
  });

  const mut = useMutation({
    mutationFn: () => api.post('/api/admin/permissions', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      onClose();
    },
    onError: (e: any) =>
      setErr(e.response?.data?.message || 'Tạo quyền thất bại'),
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
            {(resourcesData?.resources ?? []).map((r: string) => (
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
              setForm((p) => ({ ...p, action: e.target.value as any }))
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

// ─── Add Role Modal ────────────────────────────────────────────────────────────
function AddRoleModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: () => api.post('/api/admin/roles', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matrix'] });
      onClose();
    },
    onError: (e: any) =>
      setErr(e.response?.data?.message || 'Tạo vai trò thất bại'),
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

// ─── Edit Role Modal ───────────────────────────────────────────────────────────
function EditRoleModal({ role, onClose }: { role: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: role.name ?? '',
    description: role.description ?? '',
  });
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: () => api.patch(`/api/admin/roles/${role.id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matrix'] });
      onClose();
    },
    onError: (e: any) =>
      setErr(e.response?.data?.message || 'Cập nhật thất bại'),
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

// ─── User Manager Modal ────────────────────────────────────────────────────────
function UserManagerModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'roles' | 'permissions'>('roles');

  const { data: allRoles = [] } = useQuery<any[]>({
    queryKey: ['admin-roles-list'],
    queryFn: () => api.get('/api/admin/roles').then((r) => r.data),
  });
  const { data: allPerms = [] } = useQuery<any[]>({
    queryKey: ['admin-perms-list'],
    queryFn: () => api.get('/api/admin/permissions').then((r) => r.data),
  });
  const { data: userRolesData, refetch: rfRoles } = useQuery({
    queryKey: ['user-roles', user.id],
    queryFn: () =>
      api.get(`/api/admin/users/${user.id}/roles`).then((r) => r.data),
  });
  const { data: userPermsData, refetch: rfPerms } = useQuery({
    queryKey: ['user-perms', user.id],
    queryFn: () =>
      api.get(`/api/admin/users/${user.id}/permissions`).then((r) => r.data),
    enabled: tab === 'permissions',
  });

  const assignedRoleIds = new Set<number>(
    (userRolesData?.roles ?? []).map((r: any) => r.id),
  );
  const grantedPermIds = new Set<number>(
    (userPermsData?.permissions ?? []).map((p: any) => p.id),
  );

  const assignRole = useMutation({
    mutationFn: (roleId: number) =>
      api.post(`/api/admin/users/${user.id}/roles`, { roleId }),
    onSuccess: () => rfRoles(),
  });
  const removeRole = useMutation({
    mutationFn: (roleId: number) =>
      api.delete(`/api/admin/users/${user.id}/roles/${roleId}`),
    onSuccess: () => rfRoles(),
  });
  const grantPerm = useMutation({
    mutationFn: (permissionId: number) =>
      api.post(`/api/admin/users/${user.id}/permissions`, {
        permissionId,
        isGranted: true,
      }),
    onSuccess: () => rfPerms(),
  });
  const revokePerm = useMutation({
    mutationFn: (permissionId: number) =>
      api.delete(`/api/admin/users/${user.id}/permissions/${permissionId}`),
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
          allRoles.map((role: any) => {
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
          allPerms.map((perm: any) => {
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'users' | 'roles' | 'permissions'
  >('users');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const { modal: confirmModal, openConfirm } = useConfirmModal();

  useEffect(() => {
    setToken(localStorage.getItem('adminToken'));
  }, []);

  const { data: usersData, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/admin/users?role=ADMIN').then((r) => r.data),
    enabled: !!token && activeTab === 'users',
  });

  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ['admin-matrix'],
    queryFn: async () => {
      const [{ data: roles }, { data: perms }] = await Promise.all([
        api.get('/api/admin/roles'),
        api.get('/api/admin/permissions'),
      ]);
      const rolePerms = await Promise.all(
        (roles as any[]).map((r: any) =>
          api.get(`/api/admin/roles/${r.id}/permissions`).then((res) => ({
            id: r.id,
            permIds: (res.data as any[]).map((p: any) => p.id),
          })),
        ),
      );
      const matrix: Record<number, number[]> = {};
      rolePerms.forEach(({ id, permIds }) => {
        matrix[id] = permIds;
      });
      return { roles: roles as any[], permissions: perms as any[], matrix };
    },
    enabled: !!token && activeTab === 'roles',
  });

  const { data: permsData } = useQuery<any[]>({
    queryKey: ['admin-permissions'],
    queryFn: () => api.get('/api/admin/permissions').then((r) => r.data),
    enabled: !!token && activeTab === 'permissions',
  });

  const togglePermission = useMutation({
    mutationFn: ({
      roleId,
      permId,
      isAssigned,
    }: {
      roleId: number;
      permId: number;
      isAssigned: boolean;
    }) =>
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

        {activeTab === 'users' && (
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
                {usersLoading ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-10 text-center animate-pulse text-slate-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : (
                  (usersData ?? []).map((u: any) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            {matrixLoading ? (
              <div className="p-20 text-center text-slate-400">
                Đang xây dựng ma trận...
              </div>
            ) : (
              <table className="w-full text-center">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase border-r border-slate-200 sticky left-0 bg-slate-50 z-10 w-64">
                      Quyền hạn
                    </th>
                    {matrixData?.roles?.map((role: any) => (
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
                  {matrixData?.permissions?.map((perm: any) => (
                    <tr
                      key={perm.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-6 py-4 text-left text-sm font-bold text-slate-700 bg-slate-50/30 border-r border-slate-200 sticky left-0 z-10">
                        {perm.code}
                      </td>
                      {matrixData.roles.map((role: any) => {
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
                                  isAssigned,
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

        {activeTab === 'permissions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(permsData ?? []).map((p: any) => (
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
        )}

        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="p-8 bg-indigo-600 text-white rounded-[40px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition duration-500" />
              <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">
                Hệ thống
              </p>
              <p className="text-4xl font-black mt-4">TRỰC TUYẾN</p>
              <div className="mt-8 flex items-center gap-2 text-indigo-200 text-sm font-bold">
                <div className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
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

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10 font-black scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-indigo-100'}`}
    >
      {icon}
      <span className="text-sm tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />
      )}
    </button>
  );
}
