import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AttendancesService } from '../../../core/services/attendances.service';
import { SessionService } from '../../../core/services/session.service';
import { Attendance, AttendanceCreateRequest } from '../../../core/models/attendance.models';

@Component({
  selector: 'app-attendances-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './attendances-admin.component.html',
  styleUrl: './attendances-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendancesAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly attendancesService = inject(AttendancesService);
  private readonly sessionService = inject(SessionService);

  protected readonly attendances = signal<Attendance[]>([]);
  protected readonly selectedAttendanceId = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly studentSearchForm = this.fb.nonNullable.group({
    studentId: [1, [Validators.required, Validators.min(1)]]
  });
  protected readonly isFetchingByStudent = signal(false);
  protected readonly studentAttendances = signal<Attendance[]>([]);

  protected readonly attendanceForm = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
    courseId: ['', Validators.required],
    date: [''],
    status: ['Present']
  });

  protected readonly pageTitle = computed(() =>
    this.selectedAttendanceId() === null ? 'Record Attendance' : `Edit Attendance #${this.selectedAttendanceId()}`
  );

  constructor() { this.loadAttendances(); }

  protected loadAttendances(): void {
    this.isLoading.set(true); 
    this.message.set(null);
    this.attendancesService.getAll().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => this.attendances.set(data),
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set('Failed to load attendances.'); 
      }
    });
  }

  protected saveAttendance(): void {
    if (this.attendanceForm.invalid || this.isSaving()) { this.attendanceForm.markAllAsTouched(); return; }
    const v = this.attendanceForm.getRawValue();
    const payload: AttendanceCreateRequest = {
      studentId: Number(v.studentId),
      courseId: Number(v.courseId),
      date: v.date || undefined,
      status: v.status || 'Present'
    };
    const selectedId = this.selectedAttendanceId();
    this.isSaving.set(true); 
    this.message.set(null);

    const obs = (selectedId === null)
      ? this.attendancesService.create(payload)
      : this.attendancesService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(selectedId === null ? 'Attendance recorded.' : 'Attendance updated.'); 
        this.resetForm(); 
        this.loadAttendances(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(selectedId === null ? 'Failed to record attendance.' : 'Failed to update attendance.'); 
      }
    });
  }

  protected editAttendance(a: Attendance): void {
    this.selectedAttendanceId.set(a.attendanceId);
    this.attendanceForm.setValue({
      studentId: a.studentId != null ? String(a.studentId) : '',
      courseId: a.courseId != null ? String(a.courseId) : '',
      date: a.date ? String(a.date).substring(0, 10) : '',
      status: a.status ?? 'Present'
    });
  }

  protected fetchByStudent(): void {
    if (this.studentSearchForm.invalid || this.isFetchingByStudent()) { this.studentSearchForm.markAllAsTouched(); return; }
    const studentId = this.studentSearchForm.controls.studentId.getRawValue();
    this.isFetchingByStudent.set(true); this.message.set(null); this.studentAttendances.set([]);
    this.attendancesService.getByStudentId(studentId).subscribe({
      next: (data) => this.studentAttendances.set(data),
      error: () => { this.isSuccess.set(false); this.message.set(`No attendance found for student #${studentId}.`); },
      complete: () => this.isFetchingByStudent.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }
  protected resetForm(): void {
    this.selectedAttendanceId.set(null);
    this.attendanceForm.reset({ studentId: '', courseId: '', date: '', status: 'Present' });
  }
}
