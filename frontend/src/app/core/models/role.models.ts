export interface Role {
  roleId: number;
  roleName?: string;
}

export interface RoleCreateRequest {
  roleName?: string;
}

export interface RoleUpdateRequest {
  roleName?: string;
}