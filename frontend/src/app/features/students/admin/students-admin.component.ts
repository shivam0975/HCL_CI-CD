import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { StudentsService } from '../../../core/services/students.service';
import { SessionService } from '../../../core/services/session.service';
import { Student, StudentCreateRequest } from '../../../core/models/student.models';

@Component({
  selector: 'app-students-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './students-admin.component.html',
  styleUrl: './students-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentsAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentsService = inject(StudentsService);
  private readonly sessionService = inject(SessionService);

  protected readonly students = signal<Student[]>([]);
  protected readonly selectedStudentId = signal<number | null>(null);
  protected readonly detailStudent = signal<Student | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    studentId: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly studentForm = this.fb.nonNullable.group({
    userId: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [''],
    phone: [''],
    dob: [''],
    departmentId: ['']
  });

  protected readonly pageTitle = computed(() =>
    this.selectedStudentId() === null ? 'Create Student' : `Edit Student #${this.selectedStudentId()}`
  );

  constructor() { this.loadStudents(); }

  protected loadStudents(): void {
    this.isLoading.set(true); 
    this.message.set(null);
    this.studentsService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.students.set(data),
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set('Failed to load students.'); 
      }
    });
  }

  protected saveStudent(): void {
    if (this.studentForm.invalid || this.isSaving()) { this.studentForm.markAllAsTouched(); return; }
    const payload = this.toPayload();
    const selectedId = this.selectedStudentId();
    this.isSaving.set(true); 
    this.message.set(null);

    const obs = (selectedId === null)
      ? this.studentsService.create(payload)
      : this.studentsService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(selectedId === null ? 'Student created successfully.' : 'Student updated successfully.'); 
        this.resetForm(); 
        this.loadStudents(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(selectedId === null ? 'Failed to create student.' : 'Failed to update student.'); 
      }
    });
  }

  protected editStudent(student: Student): void {
    this.selectedStudentId.set(student.studentId);
    this.studentForm.setValue({
      userId: student.userId != null ? String(student.userId) : '',
      name: student.name ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      dob: student.dob ? String(student.dob).substring(0, 10) : '',
      departmentId: student.departmentId != null ? String(student.departmentId) : ''
    });
  }

  protected deleteStudent(student: Student): void {
    this.message.set(null);
    this.studentsService.delete(student.studentId).subscribe({
      next: () => { this.isSuccess.set(true); this.message.set(`Student #${student.studentId} deleted.`); if (this.selectedStudentId() === student.studentId) this.resetForm(); this.loadStudents(); },
      error: () => { this.isSuccess.set(false); this.message.set(`Failed to delete student #${student.studentId}.`); }
    });
  }

  protected fetchStudentById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) { this.detailForm.markAllAsTouched(); return; }
    const id = this.detailForm.controls.studentId.getRawValue();
    this.isFetchingDetail.set(true); this.message.set(null); this.detailStudent.set(null);
    this.studentsService.getById(id).subscribe({
      next: (s) => this.detailStudent.set(s),
      error: () => { this.isSuccess.set(false); this.message.set(`Student #${id} not found.`); },
      complete: () => this.isFetchingDetail.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }

  protected resetForm(): void {
    this.selectedStudentId.set(null);
    this.studentForm.reset({ userId: '', name: '', email: '', phone: '', dob: '', departmentId: '' });
  }

  private toPayload(): StudentCreateRequest {
    const v = this.studentForm.getRawValue();
    return {
      userId: v.userId ? Number(v.userId) : undefined,
      name: v.name.trim(),
      email: v.email.trim() || undefined,
      phone: v.phone.trim() || undefined,
      dob: v.dob || undefined,
      departmentId: v.departmentId ? Number(v.departmentId) : undefined
    };
  }
}
