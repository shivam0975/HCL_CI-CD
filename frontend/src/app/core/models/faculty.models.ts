export interface Faculty {
  id?: number;
  facultyId?: number;
  userId: string | number;
  name: string;
  email: string | null;
  departmentId: string | number;
  departmentName?: string;
  username?: string;
  role?: {
    roleId: number;
    roleName: string;
  };
  createdAt?: string;
}

export interface FacultyCreateRequest {
  userId: string;
  name: string;
  email: string | null;
  departmentId: string;
}

export interface FacultyUpdateRequest {
  userId: string;
  name: string;
  email: string | null;
  departmentId: string;
}
