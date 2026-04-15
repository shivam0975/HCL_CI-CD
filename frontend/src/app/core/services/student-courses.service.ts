import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentCourse, StudentCourseCreateRequest, StudentCourseUpdateRequest } from '../models/student-course.models';

@Injectable({ providedIn: 'root' })
export class StudentCoursesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/StudentCourses';

  getAll(): Observable<StudentCourse[]> { return this.http.get<StudentCourse[]>(this.baseUrl); }
  create(payload: StudentCourseCreateRequest): Observable<StudentCourse> { return this.http.post<StudentCourse>(this.baseUrl, payload); }
  getById(id: string | number): Observable<StudentCourse> { return this.http.get<StudentCourse>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
  update(id: string | number, payload: StudentCourseUpdateRequest): Observable<StudentCourse> { return this.http.put<StudentCourse>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
  delete(id: string | number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
}