import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreateRequest, UserUpdateRequest } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Users';

  getAll(): Observable<User[]> { return this.http.get<User[]>(this.baseUrl); }
  create(payload: UserCreateRequest): Observable<User> { return this.http.post<User>(this.baseUrl, payload); }
  getById(id: string | number): Observable<User> { return this.http.get<User>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
  update(id: string | number, payload: UserUpdateRequest): Observable<User> { return this.http.put<User>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
  delete(id: string | number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`); }
}