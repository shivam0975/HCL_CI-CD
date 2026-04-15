export interface CourseFaculty {
  id: number;
  courseId?: number;
  facultyId?: number;
  assignedAt?: string | Date;
}

export interface CourseFacultyCreateRequest {
  courseId?: number;
  facultyId?: number;
}

export interface CourseFacultyUpdateRequest {
  courseId?: number;
  facultyId?: number;
}