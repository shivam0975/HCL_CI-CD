import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Department,
  DepartmentCreateRequest,
  DepartmentUpdateRequest
} from '../models/department.models';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Departments';

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseUrl);
  }

  create(payload: DepartmentCreateRequest): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, payload);
  }

  getById(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  update(id: string, payload: DepartmentUpdateRequest): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}
