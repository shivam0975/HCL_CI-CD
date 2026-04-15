export interface Attendance {
  attendanceId: number;
  studentId?: number;
  courseId?: number;
  date?: string | Date;
  status?: string;
}

export interface AttendanceCreateRequest {
  studentId?: number;
  courseId?: number;
  date?: string | Date;
  status?: string;
}

export interface AttendanceUpdateRequest {
  studentId?: number;
  courseId?: number;
  date?: string | Date;
  status?: string;
}