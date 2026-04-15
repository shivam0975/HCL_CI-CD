import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FacultiesService } from '../../../core/services/faculties.service';
import { SessionService } from '../../../core/services/session.service';
import { Faculty, FacultyCreateRequest } from '../../../core/models/faculty.models';

@Component({
  selector: 'app-faculties-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './faculties-admin.component.html',
  styleUrl: './faculties-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacultiesAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly facultiesService = inject(FacultiesService);
  private readonly sessionService = inject(SessionService);

  protected readonly faculties = signal<Faculty[]>([]);
  protected readonly selectedFacultyId = signal<number | null>(null);
  protected readonly detailFaculty = signal<Faculty | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    id: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly facultyForm = this.fb.nonNullable.group({
    userId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [''],
    departmentId: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
  });

  protected readonly pageTitle = computed(() =>
    this.selectedFacultyId() === null ? 'Create Faculty' : `Edit Faculty #${this.selectedFacultyId()}`
  );

  constructor() {
    this.loadFaculties();
  }

  protected loadFaculties(): void {
    this.isLoading.set(true);
    this.message.set(null);
    this.facultiesService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.faculties.set(data),
      error: () => {
        this.isSuccess.set(false);
        this.message.set('Failed to load faculties list.');
      }
    });
  }

  protected saveFaculty(): void {
    if (this.facultyForm.invalid || this.isSaving()) {
      this.facultyForm.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    const selectedId = this.selectedFacultyId();
    this.isSaving.set(true);
    this.message.set(null);

    const obs = (selectedId === null)
      ? this.facultiesService.create(payload)
      : this.facultiesService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set(selectedId === null ? 'Faculty created successfully.' : 'Faculty updated successfully.');
        this.resetForm();
        this.loadFaculties();
      },
      error: (err) => {
        this.isSuccess.set(false);
        const errorMsg = err.error?.message || err.error || 'Failed to save faculty.';
        this.message.set(typeof errorMsg === 'string' ? errorMsg : 'Failed to save faculty.');
      }
    });
  }

  protected editFaculty(faculty: Faculty): void {
    const id = this.getFacultyId(faculty);
    if (id === null) return;
    
    this.selectedFacultyId.set(id);
    this.facultyForm.setValue({
      userId: String(faculty.userId ?? ''),
      name: faculty.name ?? '',
      email: faculty.email ?? '',
      departmentId: String(faculty.departmentId ?? '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected deleteFaculty(faculty: Faculty): void {
    const id = this.getFacultyId(faculty);

    if (id === null) {
      this.isSuccess.set(false);
      this.message.set('Cannot delete faculty without a valid id.');
      return;
    }

    if (!confirm(`Are you sure you want to delete Faculty #${id}?`)) {
      return;
    }

    this.message.set(null);
    this.facultiesService.delete(id).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set(`Faculty #${id} deleted successfully.`);
        if (this.selectedFacultyId() === id) {
          this.resetForm();
        }
        this.loadFaculties();
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set(`Failed to delete faculty #${id}.`);
      }
    });
  }

  protected fetchFacultyById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) {
      this.detailForm.markAllAsTouched();
      return;
    }

    const id = this.detailForm.controls.id.getRawValue();

    this.isFetchingDetail.set(true);
    this.message.set(null);
    this.detailFaculty.set(null);

    this.facultiesService.getById(id).subscribe({
      next: (faculty) => {
        this.detailFaculty.set(faculty);
        this.isFetchingDetail.set(false);
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set(`Faculty #${id} was not found.`);
        this.isFetchingDetail.set(false);
      }
    });
  }

  protected logout(): void {
    this.sessionService.clearSession();
  }

  protected resetForm(): void {
    this.selectedFacultyId.set(null);
    this.facultyForm.reset({
      userId: '',
      name: '',
      email: '',
      departmentId: ''
    });
  }

  private toPayload(): any {
    const rawValue = this.facultyForm.getRawValue();

    return {
      userId: rawValue.userId ? parseInt(rawValue.userId, 10) : null,
      name: rawValue.name.trim(),
      email: rawValue.email.trim() === '' ? null : rawValue.email.trim(),
      departmentId: rawValue.departmentId ? parseInt(rawValue.departmentId, 10) : null
    };
  }

  private getFacultyId(faculty: Faculty): number | null {
    const id = faculty.facultyId ?? faculty.id;
    return typeof id === 'number' ? id : null;
  }
}

