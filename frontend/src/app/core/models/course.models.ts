export interface Course {
  courseId: number;
  courseName: string;
  courseCode?: string;
  credits?: number;
  semester?: number;
  departmentId?: number;
}

export interface CourseCreateRequest {
  courseName: string;
  courseCode?: string;
  credits?: number;
  semester?: number;
  departmentId?: number;
}

export interface CourseUpdateRequest {
  courseName: string;
  courseCode?: string;
  credits?: number;
  semester?: number;
  departmentId?: number;
}