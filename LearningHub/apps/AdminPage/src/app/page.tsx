'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Key,
  Activity,
  Plus,
  Settings,
  UserCog,
} from 'lucide-react';
import '@aejkatappaja/phantom-ui';
import type { Role, User } from '@learning-hub/domain';
import { useConfirmModal } from '../components/admin/modal';
import { LoginScreen } from '../components/admin/login-screen';
import { TabButton } from '../components/admin/tab-button';
import { CreateAdminModal } from '../components/admin/create-admin-modal';
import { AddPermissionModal } from '../components/admin/add-permission-modal';
import { AddRoleModal } from '../components/admin/add-role-modal';
import { EditRoleModal } from '../components/admin/edit-role-modal';
import { UserManagerModal } from '../components/admin/user-manager-modal';
import { EditUserModal } from '../components/admin/edit-user-modal';
import { UsersTab } from './tabs/users-tab';
import { RolesTab } from './tabs/roles-tab';
import { PermissionsTab } from './tabs/permissions-tab';
import { MonitoringTab } from './tabs/monitoring-tab';
import { UserAdminTab } from './tabs/user-admin-tab';

type TabKey = 'monitoring' | 'users' | 'roles' | 'permissions' | 'user-admin';

const tabTitle: Record<TabKey, string> = {
  users: 'Quản lý Thành viên',
  roles: 'Ma trận Vai trò & Quyền',
  permissions: 'Danh mục Quyền hạn',
  monitoring: 'Giám sát Hệ thống',
  'user-admin': 'Quản trị User',
};

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { modal: confirmModal, openConfirm } = useConfirmModal();

  useEffect(() => {
    setToken(localStorage.getItem('adminToken'));
  }, []);

  if (token === null)
    return (
      <LoginScreen
        onLogin={() => setToken(localStorage.getItem('adminToken'))}
      />
    );

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
          <TabButton
            active={activeTab === 'user-admin'}
            onClick={() => setActiveTab('user-admin')}
            icon={<UserCog className="h-5 w-5" />}
            label="Quản trị User"
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
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
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
          <UsersTab
            onSelectUser={setSelectedUser}
            onEditUser={setEditingUser}
            openConfirm={openConfirm}
          />
        )}
        {activeTab === 'roles' && (
          <RolesTab openConfirm={openConfirm} onEditRole={setEditingRole} />
        )}
        {activeTab === 'permissions' && (
          <PermissionsTab openConfirm={openConfirm} />
        )}
        {activeTab === 'monitoring' && <MonitoringTab />}
        {activeTab === 'user-admin' && <UserAdminTab />}
      </main>
      {confirmModal}
    </div>
  );
}
