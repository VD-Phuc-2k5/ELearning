import axios from 'axios';
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
import {
  AuthenticationException,
  NetworkException,
  NotFoundException,
  PermissionException,
  UnknownException,
} from '@learning-hub/core';
import { IAuthRemoteDataSource } from './IAuthRemoteDataSource';

export class AuthRemoteDataSourceImpl implements IAuthRemoteDataSource {
  private api = axios.create({
    baseURL: process.env.NEST_API_URL || 'http://localhost:8080',
  });

  private getAuthHeader(token?: string) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private handleError(e: unknown): never {
    if (axios.isAxiosError(e)) {
      if (!e.response) throw new NetworkException();
      const status = e.response.status;
      const message: string = e.response.data?.message || e.message;
      if (status === 401) throw new AuthenticationException(message);
      if (status === 403) throw new PermissionException(message);
      if (status === 404) throw new NotFoundException(message);
      throw new UnknownException();
    }
    throw new NetworkException();
  }

  async register(data: RegisterParams): Promise<{ user: User }> {
    try {
      const res = await this.api.post('/auth/register', data);
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async login(data: LoginParams): Promise<AuthTokens> {
    try {
      const res = await this.api.post('/auth/login', data);
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async adminLogin(data: LoginParams): Promise<AuthTokens> {
    try {
      const res = await this.api.post('/auth/admin/login', data);
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async refreshToken(data: { refreshToken: string }): Promise<AuthTokens> {
    try {
      const res = await this.api.post('/auth/refresh', data);
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async logout(token?: string): Promise<void> {
    try {
      await this.api.post(
        '/auth/logout',
        {},
        { headers: this.getAuthHeader(token) },
      );
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getProfile(token?: string): Promise<User> {
    try {
      const res = await this.api.get('/auth/profile', {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getUsers(token?: string): Promise<User[]> {
    try {
      const res = await this.api.get('/admin/users', {
        params: { role: 'ADMIN' },
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async registerAdmin(
    data: RegisterParams,
    token?: string,
  ): Promise<{ user: User }> {
    try {
      const res = await this.api.post('/auth/admin/register', data, {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async updateUser(
    id: string,
    data: UpdateAdminParams,
    token?: string,
  ): Promise<User> {
    try {
      const res = await this.api.patch(`/admin/users/${id}`, data, {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteUser(id: string, token?: string): Promise<void> {
    try {
      await this.api.delete(`/admin/users/${id}`, {
        headers: this.getAuthHeader(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async searchUsersByEmail(email: string, token?: string): Promise<User[]> {
    try {
      const res = await this.api.get('/admin/users/search', {
        params: { email },
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getRoles(token?: string): Promise<Role[]> {
    try {
      const res = await this.api.get('/admin/roles', {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async createRole(data: CreateRoleParams, token?: string): Promise<Role> {
    try {
      const res = await this.api.post('/admin/roles', data, {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async updateRole(
    id: number,
    data: UpdateRoleParams,
    token?: string,
  ): Promise<Role> {
    try {
      const res = await this.api.patch(`/admin/roles/${id}`, data, {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteRole(id: number, token?: string): Promise<void> {
    try {
      await this.api.delete(`/admin/roles/${id}`, {
        headers: this.getAuthHeader(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getPermissions(token?: string): Promise<Permission[]> {
    try {
      const res = await this.api.get('/admin/permissions', {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getResources(token?: string): Promise<{ resources: string[] }> {
    try {
      const res = await this.api.get('/admin/permissions/resources', {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async createPermission(
    data: CreatePermissionParams,
    token?: string,
  ): Promise<Permission> {
    try {
      const res = await this.api.post('/admin/permissions', data, {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deletePermission(id: number, token?: string): Promise<void> {
    try {
      await this.api.delete(`/admin/permissions/${id}`, {
        headers: this.getAuthHeader(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getRolePermissions(
    roleId: number,
    token?: string,
  ): Promise<Permission[]> {
    try {
      const res = await this.api.get(`/admin/roles/${roleId}/permissions`, {
        headers: this.getAuthHeader(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async assignPermission(
    roleId: number,
    permissionId: number,
    token?: string,
  ): Promise<void> {
    try {
      await this.api.post(
        `/admin/roles/${roleId}/permissions`,
        { permissionId },
        { headers: this.getAuthHeader(token) },
      );
    } catch (e) {
      return this.handleError(e);
    }
  }

  async removePermission(
    roleId: number,
    permissionId: number,
    token?: string,
  ): Promise<void> {
    try {
      await this.api.delete(
        `/admin/roles/${roleId}/permissions/${permissionId}`,
        { headers: this.getAuthHeader(token) },
      );
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getUserRoles(userId: string, token?: string): Promise<Role[]> {
    try {
      const res = await this.api.get(`/admin/users/${userId}/roles`, {
        headers: this.getAuthHeader(token),
      });
      return res.data.roles;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async assignRoleToUser(
    userId: string,
    roleId: number,
    token?: string,
  ): Promise<void> {
    try {
      await this.api.post(
        `/admin/users/${userId}/roles`,
        { roleId },
        { headers: this.getAuthHeader(token) },
      );
    } catch (e) {
      return this.handleError(e);
    }
  }

  async removeRoleFromUser(
    userId: string,
    roleId: number,
    token?: string,
  ): Promise<void> {
    try {
      await this.api.delete(`/admin/users/${userId}/roles/${roleId}`, {
        headers: this.getAuthHeader(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getUserPermissions(
    userId: string,
    token?: string,
  ): Promise<Permission[]> {
    try {
      const res = await this.api.get(`/admin/users/${userId}/permissions`, {
        headers: this.getAuthHeader(token),
      });
      return res.data.permissions;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async grantUserPermission(
    userId: string,
    data: GrantPermissionParams,
    token?: string,
  ): Promise<void> {
    try {
      await this.api.post(`/admin/users/${userId}/permissions`, data, {
        headers: this.getAuthHeader(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async revokeUserPermission(
    userId: string,
    permissionId: number,
    token?: string,
  ): Promise<void> {
    try {
      await this.api.delete(
        `/admin/users/${userId}/permissions/${permissionId}`,
        { headers: this.getAuthHeader(token) },
      );
    } catch (e) {
      return this.handleError(e);
    }
  }
}
