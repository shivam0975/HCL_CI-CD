import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentCreateRequest, StudentUpdateRequest } from '../models/student.models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Students';

  getAll(): Observable<Student[]> { return this.http.get<Student[]>(this.baseUrl); }
  create(payload: StudentCreateRequest): Observable<Student> { return this.http.post<Student>(this.baseUrl, payload); }
  getById(id: string | number): Observable<Student> { return this.http.get<Student>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
  update(id: string | number, payload: StudentUpdateRequest): Observable<Student> { return this.http.put<Student>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
  delete(id: string | number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
}