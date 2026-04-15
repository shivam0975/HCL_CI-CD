import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, RoleCreateRequest, RoleUpdateRequest } from '../models/role.models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Roles';

  getAll(): Observable<Role[]> { return this.http.get<Role[]>(this.baseUrl); }
  create(payload: RoleCreateRequest): Observable<Role> { return this.http.post<Role>(this.baseUrl, payload); }
  getById(id: string | number): Observable<Role> { return this.http.get<Role>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
  update(id: string | number, payload: RoleUpdateRequest): Observable<Role> { return this.http.put<Role>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
  delete(id: string | number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
}