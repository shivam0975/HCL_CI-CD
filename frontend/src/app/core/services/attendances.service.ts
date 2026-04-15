import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceCreateRequest, AttendanceUpdateRequest } from '../models/attendance.models';

@Injectable({ providedIn: 'root' })
export class AttendancesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/Attendances';

  getAll(): Observable<Attendance[]> { return this.http.get<Attendance[]>(this.baseUrl); }
  getByStudentId(studentId: number): Observable<Attendance[]> { return this.http.get<Attendance[]>(`${this.baseUrl}/student/${studentId}`); }
  create(payload: AttendanceCreateRequest): Observable<Attendance> { return this.http.post<Attendance>(this.baseUrl, payload); }
  update(id: string | number, payload: AttendanceUpdateRequest): Observable<Attendance> { return this.http.put<Attendance>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload); }
}