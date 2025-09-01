export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'admin' | 'super_admin' | 'participant' | 'donor';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: Omit<User, 'password'>;
    token: string;
    expiresIn: string;
  };
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: string;
  };
}

export interface AuthError {
  error: string;
  message?: string;
  statusCode: number;
}

export interface PermissionCheck {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  organizationId?: string;
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  requireOrganization?: boolean;
  requireSameOrganization?: boolean;
  permissions?: PermissionCheck[];
}