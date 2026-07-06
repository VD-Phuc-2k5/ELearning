import axios from 'axios';
import { getServerCookies } from '../../serverCookies';
import {
  AuthTokens,
  CreatePermissionParams,
  CreateRoleParams,
  GrantPermissionParams,
  LoginParams,
  Permission,
  RegisterParams,
  Role,
  UpdateAdminParams,
  UpdateRoleParams,
  User,
} from '@learning-hub/domain';
import { handleAxiosError } from '@learning-hub/core';
import { IAuthRemoteDataSource } from './IAuthRemoteDataSource';

export class AuthRemoteDataSourceImpl implements IAuthRemoteDataSource {
  private api = axios.create({
    baseURL: `${process.env.NEST_API_URL || 'http://localhost:8080'}/api`,
    withCredentials: true,
  });

  constructor() {
    this.api.interceptors.request.use(async (config) => {
      config.headers.Cookie = await getServerCookies();
      return config;
    });
  }

  async register(data: RegisterParams): Promise<{ user: User }> {
    try {
      const res = await this.api.post('/auth/register', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async login(data: LoginParams): Promise<AuthTokens> {
    try {
      const res = await this.api.post('/auth/login', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async adminLogin(data: LoginParams): Promise<AuthTokens> {
    try {
      const res = await this.api.post('/auth/admin/login', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async refreshToken(data: { token: string }): Promise<AuthTokens> {
    try {
      const res = await this.api.post('/auth/refresh', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.api.post('/auth/logout', { refreshToken });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getProfile(): Promise<User> {
    try {
      const res = await this.api.get('/auth/profile');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getUsers(role?: string): Promise<User[]> {
    try {
      const res = await this.api.get('/admin/users', {
        params: { role: role || 'ADMIN' },
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async registerAdmin(data: RegisterParams): Promise<{ user: User }> {
    try {
      const res = await this.api.post('/auth/admin/register', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateUser(id: string, data: UpdateAdminParams): Promise<User> {
    try {
      const res = await this.api.patch(`/admin/users/${id}`, data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.api.delete(`/admin/users/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async searchUsersByEmail(email: string): Promise<User[]> {
    try {
      const res = await this.api.get('/admin/users/search', {
        params: { email },
      });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const res = await this.api.get('/admin/roles');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createRole(data: CreateRoleParams): Promise<Role> {
    try {
      const res = await this.api.post('/admin/roles', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateRole(id: number, data: UpdateRoleParams): Promise<Role> {
    try {
      const res = await this.api.patch(`/admin/roles/${id}`, data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      await this.api.delete(`/admin/roles/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getPermissions(): Promise<Permission[]> {
    try {
      const res = await this.api.get('/admin/permissions');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getResources(): Promise<{ resources: string[] }> {
    try {
      const res = await this.api.get('/admin/permissions/resources');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createPermission(data: CreatePermissionParams): Promise<Permission> {
    try {
      const res = await this.api.post('/admin/permissions', data);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deletePermission(id: number): Promise<void> {
    try {
      await this.api.delete(`/admin/permissions/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    try {
      const res = await this.api.get(`/admin/roles/${roleId}/permissions`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    try {
      await this.api.post(`/admin/roles/${roleId}/permissions`, {
        permissionId,
      });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async removePermission(roleId: number, permissionId: number): Promise<void> {
    try {
      await this.api.delete(
        `/admin/roles/${roleId}/permissions/${permissionId}`,
      );
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const res = await this.api.get(`/admin/users/${userId}/roles`);
      return res.data.roles;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<void> {
    try {
      await this.api.post(`/admin/users/${userId}/roles`, { roleId });
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async removeRoleFromUser(userId: string, roleId: number): Promise<void> {
    try {
      await this.api.delete(`/admin/users/${userId}/roles/${roleId}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const res = await this.api.get(`/admin/users/${userId}/permissions`);
      return res.data.permissions;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async grantUserPermission(
    userId: string,
    data: GrantPermissionParams,
  ): Promise<void> {
    try {
      await this.api.post(`/admin/users/${userId}/permissions`, data);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async revokeUserPermission(
    userId: string,
    permissionId: number,
  ): Promise<void> {
    try {
      await this.api.delete(
        `/admin/users/${userId}/permissions/${permissionId}`,
      );
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
