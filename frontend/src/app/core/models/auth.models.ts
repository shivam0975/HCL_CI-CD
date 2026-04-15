export interface RegisterRequest {
  username: string;
  password: string;
  roleId: string | number;
  roleName: string | null;
}

export interface RegisterResponse {
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message?: string;
}
