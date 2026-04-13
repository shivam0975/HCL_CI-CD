import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly registerUrl = 'http://localhost:5074/api/Auth/register';
  private readonly loginUrl = 'http://localhost:5074/api/Auth/login';

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.registerUrl, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, payload);
  }
}
