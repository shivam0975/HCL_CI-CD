import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseFaculty, CourseFacultyCreateRequest, CourseFacultyUpdateRequest } from '../models/course-faculty.models';

@Injectable({ providedIn: 'root' })
export class CourseFacultiesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/CourseFaculties';

  getAll(): Observable<CourseFaculty[]> { return this.http.get<CourseFaculty[]>(this.baseUrl); }
  create(payload: CourseFacultyCreateRequest): Observable<CourseFaculty> { return this.http.post<CourseFaculty>(this.baseUrl, payload); }
  getById(id: string | number): Observable<CourseFaculty> { return this.http.get<CourseFaculty>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
  update(id: string | number, payload: CourseFacultyUpdateRequest): Observable<CourseFaculty> { return this.http.put<CourseFaculty>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
  delete(id: string | number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
}