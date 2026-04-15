export interface StudentCourse {
  id: number;
  studentId?: number;
  courseId?: number;
  enrolledAt?: string | Date;
}

export interface StudentCourseCreateRequest {
  studentId?: number;
  courseId?: number;
}

export interface StudentCourseUpdateRequest {
  studentId?: number;
  courseId?: number;
}