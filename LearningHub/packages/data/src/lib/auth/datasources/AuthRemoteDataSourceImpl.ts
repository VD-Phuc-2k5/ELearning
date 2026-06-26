import axios from 'axios';

export interface IAuthRemoteDataSource {
    register(data: any): Promise<any>;
    login(data: any): Promise<any>;
    adminLogin(data: any): Promise<any>;
    refreshToken(data: any): Promise<any>;
    logout(token?: string): Promise<any>;
    getProfile(token?: string): Promise<any>;

    getUsers(token?: string): Promise<any>;
    registerAdmin(data: any, token?: string): Promise<any>;

    getRoles(token?: string): Promise<any>;
    createRole(data: any, token?: string): Promise<any>;
    updateRole(id: number, data: any, token?: string): Promise<any>;
    deleteRole(id: number, token?: string): Promise<any>;

    getPermissions(token?: string): Promise<any>;
    getResources(token?: string): Promise<any>;
    createPermission(data: any, token?: string): Promise<any>;
    deletePermission(id: number, token?: string): Promise<any>;

    getRolePermissions(roleId: number, token?: string): Promise<any>;
    assignPermission(roleId: number, permissionId: number, token?: string): Promise<any>;
    removePermission(roleId: number, permissionId: number, token?: string): Promise<any>;

    getUserRoles(userId: string, token?: string): Promise<any>;
    assignRoleToUser(userId: string, roleId: number, token?: string): Promise<any>;
    removeRoleFromUser(userId: string, roleId: number, token?: string): Promise<any>;

    getUserPermissions(userId: string, token?: string): Promise<any>;
    grantUserPermission(userId: string, data: any, token?: string): Promise<any>;
    revokeUserPermission(userId: string, permissionId: number, token?: string): Promise<any>;
}

export class AuthRemoteDataSourceImpl implements IAuthRemoteDataSource {
    private api = axios.create({
        baseURL: process.env.NEST_API_URL || 'http://localhost:8080',
    });

    private getAuthHeader(token?: string) {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async register(data: any) {
        const res = await this.api.post('/auth/register', data);
        return res.data;
    }

    async login(data: any) {
        const res = await this.api.post('/auth/login', data);
        return res.data;
    }

    async adminLogin(data: any) {
        const res = await this.api.post('/auth/admin/login', data);
        return res.data;
    }

    async refreshToken(data: any) {
        const res = await this.api.post('/auth/refresh', data);
        return res.data;
    }

    async logout(token?: string) {
        await this.api.post('/auth/logout', {}, { headers: this.getAuthHeader(token) });
    }

    async getProfile(token?: string) {
        const res = await this.api.get('/auth/profile', { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async getUsers(token?: string) {
        const res = await this.api.get('/admin/users', { params: { role: 'USER' }, headers: this.getAuthHeader(token) });
        return res.data;
    }

    async registerAdmin(data: any, token?: string) {
        const res = await this.api.post('/auth/admin/register', data, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async getRoles(token?: string) {
        const res = await this.api.get('/admin/roles', { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async createRole(data: any, token?: string) {
        const res = await this.api.post('/admin/roles', data, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async updateRole(id: number, data: any, token?: string) {
        const res = await this.api.patch(`/admin/roles/${id}`, data, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async deleteRole(id: number, token?: string) {
        await this.api.delete(`/admin/roles/${id}`, { headers: this.getAuthHeader(token) });
    }

    async getPermissions(token?: string) {
        const res = await this.api.get('/admin/permissions', { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async getResources(token?: string) {
        const res = await this.api.get('/admin/permissions/resources', { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async createPermission(data: any, token?: string) {
        const res = await this.api.post('/admin/permissions', data, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async deletePermission(id: number, token?: string) {
        await this.api.delete(`/admin/permissions/${id}`, { headers: this.getAuthHeader(token) });
    }

    async getRolePermissions(roleId: number, token?: string) {
        const res = await this.api.get(`/admin/roles/${roleId}/permissions`, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async assignPermission(roleId: number, permissionId: number, token?: string) {
        await this.api.post(`/admin/roles/${roleId}/permissions`, { permissionId }, { headers: this.getAuthHeader(token) });
    }

    async removePermission(roleId: number, permissionId: number, token?: string) {
        await this.api.delete(`/admin/roles/${roleId}/permissions/${permissionId}`, { headers: this.getAuthHeader(token) });
    }

    async getUserRoles(userId: string, token?: string) {
        const res = await this.api.get(`/admin/user-roles/${userId}`, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async assignRoleToUser(userId: string, roleId: number, token?: string) {
        await this.api.post(`/admin/user-roles/${userId}`, { roleId }, { headers: this.getAuthHeader(token) });
    }

    async removeRoleFromUser(userId: string, roleId: number, token?: string) {
        await this.api.delete(`/admin/user-roles/${userId}/${roleId}`, { headers: this.getAuthHeader(token) });
    }

    async getUserPermissions(userId: string, token?: string) {
        const res = await this.api.get(`/admin/users/${userId}/permissions`, { headers: this.getAuthHeader(token) });
        return res.data;
    }

    async grantUserPermission(userId: string, data: any, token?: string) {
        await this.api.post(`/admin/users/${userId}/permissions`, data, { headers: this.getAuthHeader(token) });
    }

    async revokeUserPermission(userId: string, permissionId: number, token?: string) {
        await this.api.delete(`/admin/users/${userId}/permissions/${permissionId}`, { headers: this.getAuthHeader(token) });
    }
}
