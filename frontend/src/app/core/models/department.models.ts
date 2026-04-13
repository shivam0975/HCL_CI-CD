export interface Department {
  departmentId: string;
  name: string;
}

export interface DepartmentCreateRequest {
  name: string;
}

export interface DepartmentUpdateRequest {
  name: string;
}
