export interface User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly isActive?: boolean;
  readonly roles?: Role[];
}

export interface Role {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
}

export interface Permission {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly resource?: string;
  readonly action?: string;
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface LoginParams {
  email: string;
  password: string;
  rejectAdminRole?: boolean;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface CreateRoleParams {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRoleParams {
  name?: string;
  description?: string;
}

export interface CreatePermissionParams {
  resource: string;
  action: string;
  name: string;
}

export interface GrantPermissionParams {
  permissionId: number;
  isGranted: boolean;
}

export interface UpdateAdminParams {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}
