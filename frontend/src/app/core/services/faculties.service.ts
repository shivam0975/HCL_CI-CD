import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Faculty, FacultyCreateRequest, FacultyUpdateRequest } from '../models/faculty.models';

@Injectable({
  providedIn: 'root'
})
export class FacultiesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Faculties';

  getAll(): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(this.baseUrl);
  }

  create(payload: FacultyCreateRequest): Observable<Faculty> {
    return this.http.post<Faculty>(this.baseUrl, payload);
  }

  getById(id: number): Observable<Faculty> {
    return this.http.get<Faculty>(`${this.baseUrl}/${id}`);
  }

  update(id: number, payload: FacultyUpdateRequest): Observable<Faculty> {
    return this.http.put<Faculty>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
