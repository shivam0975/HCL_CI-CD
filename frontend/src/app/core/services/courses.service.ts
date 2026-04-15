import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CourseCreateRequest, CourseUpdateRequest } from '../models/course.models';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Courses';

  getAll(): Observable<Course[]> { return this.http.get<Course[]>(this.baseUrl); }
  create(payload: CourseCreateRequest): Observable<Course> { return this.http.post<Course>(this.baseUrl, payload); }
  getById(id: string | number): Observable<Course> { return this.http.get<Course>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
  update(id: string | number, payload: CourseUpdateRequest): Observable<Course> { return this.http.put<Course>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
  delete(id: string | number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
}