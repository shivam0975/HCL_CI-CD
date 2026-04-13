import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
    userId: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [''],
    departmentId: ['', Validators.required]
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

    this.facultiesService.getAll().subscribe({
      next: (data) => {
        this.faculties.set(data);
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set('Failed to load faculties list.');
      },
      complete: () => {
        this.isLoading.set(false);
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

    if (selectedId === null) {
      this.facultiesService.create(payload).subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.message.set('Faculty created successfully.');
          this.resetForm();
          this.loadFaculties();
        },
        error: () => {
          this.isSuccess.set(false);
          this.message.set('Failed to create faculty.');
        },
        complete: () => {
          this.isSaving.set(false);
        }
      });
      return;
    }

    this.facultiesService.update(selectedId, payload).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set('Faculty updated successfully.');
        this.resetForm();
        this.loadFaculties();
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set('Failed to update faculty.');
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }

  protected editFaculty(faculty: Faculty): void {
    this.selectedFacultyId.set(this.getFacultyId(faculty));
    this.facultyForm.setValue({
      userId: String(faculty.userId ?? ''),
      name: faculty.name ?? '',
      email: faculty.email ?? '',
      departmentId: String(faculty.departmentId ?? '')
    });
  }

  protected deleteFaculty(faculty: Faculty): void {
    const id = this.getFacultyId(faculty);

    if (id === null) {
      this.isSuccess.set(false);
      this.message.set('Cannot delete faculty without a valid id.');
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
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set(`Faculty #${id} was not found.`);
      },
      complete: () => {
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

  private toPayload(): FacultyCreateRequest {
    const rawValue = this.facultyForm.getRawValue();

    return {
      userId: String(rawValue.userId).trim(),
      name: rawValue.name.trim(),
      email: rawValue.email.trim() === '' ? null : rawValue.email.trim(),
      departmentId: String(rawValue.departmentId).trim()
    };
  }

  private getFacultyId(faculty: Faculty): number | null {
    if (typeof faculty.facultyId === 'number') {
      return faculty.facultyId;
    }

    if (typeof faculty.id === 'number') {
      return faculty.id;
    }

    return null;
  }
}
