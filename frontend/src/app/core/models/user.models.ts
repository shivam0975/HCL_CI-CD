import { Role } from './role.models';

export interface User {
  userId: number;
  username: string;
  role?: Role;
  createdAt?: string | Date;
}

export interface UserCreateRequest {
  username: string;
  password?: string;
  role?: Role;
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  role?: Role;
}