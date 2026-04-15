export interface Student {
  studentId: number;
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  dob?: string | Date;
  departmentId?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface StudentCreateRequest {
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  dob?: string | Date;
  departmentId?: number;
}

export interface StudentUpdateRequest {
  name: string;
  email?: string;
  phone?: string;
  dob?: string | Date;
  departmentId?: number;
}