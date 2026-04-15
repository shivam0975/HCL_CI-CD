import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { DepartmentsService } from '../../../core/services/departments.service';
import { SessionService } from '../../../core/services/session.service';
import { Department, DepartmentCreateRequest } from '../../../core/models/department.models';

@Component({
  selector: 'app-departments-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './departments-admin.component.html',
  styleUrl: './departments-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentsAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly sessionService = inject(SessionService);

  protected readonly departments = signal<Department[]>([]);
  protected readonly selectedDepartmentId = signal<string | null>(null);
  protected readonly detailDepartment = signal<Department | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    departmentId: ['', Validators.required]
  });

  protected readonly departmentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  protected readonly pageTitle = computed(() =>
    this.selectedDepartmentId() === null ? 'Create Department' : `Edit Department ${this.selectedDepartmentId()}`
  );

  constructor() {
    this.loadDepartments();
  }

  protected loadDepartments(): void {
    this.isLoading.set(true);
    this.message.set(null);
    this.departmentsService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.departments.set(data),
      error: () => {
        this.isSuccess.set(false);
        this.message.set('Failed to load departments list.');
      }
    });
  }

  protected saveDepartment(): void {
    if (this.departmentForm.invalid || this.isSaving()) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    const selectedId = this.selectedDepartmentId();
    this.isSaving.set(true);
    this.message.set(null);

    const obs = (selectedId === null)
      ? this.departmentsService.create(payload)
      : this.departmentsService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set(selectedId === null ? 'Department created successfully.' : 'Department updated successfully.');
        this.resetForm();
        this.loadDepartments();
      },
      error: (err) => {
        this.isSuccess.set(false);
        const errorMsg = err.error?.message || err.error || 'Failed to save department.';
        this.message.set(typeof errorMsg === 'string' ? errorMsg : 'Failed to save department.');
      }
    });
  }

  protected editDepartment(department: Department): void {
    const id = this.getDepartmentId(department);
    this.selectedDepartmentId.set(id);
    this.departmentForm.setValue({ name: department.name ?? '' });
  }

  protected deleteDepartment(department: Department): void {
    const id = this.getDepartmentId(department);

    if (id === null) {
      this.isSuccess.set(false);
      this.message.set('Cannot delete department without a valid id.');
      return;
    }

    if (!confirm(`Are you sure you want to delete department ${id}?`)) {
      return;
    }

    this.message.set(null);
    this.departmentsService.delete(id).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set(`Department ${id} deleted successfully.`);
        if (this.selectedDepartmentId() === id) {
          this.resetForm();
        }
        this.loadDepartments();
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set(`Failed to delete department ${id}.`);
      }
    });
  }

  protected fetchDepartmentById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) {
      this.detailForm.markAllAsTouched();
      return;
    }

    const id = this.detailForm.controls.departmentId.getRawValue().trim();
    this.isFetchingDetail.set(true);
    this.message.set(null);
    this.detailDepartment.set(null);

    this.departmentsService.getById(id).subscribe({
      next: (department) => {
        this.detailDepartment.set(department);
        this.isFetchingDetail.set(false);
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set(`Department ${id} was not found.`);
        this.isFetchingDetail.set(false);
      }
    });
  }

  protected logout(): void {
    this.sessionService.clearSession();
  }

  protected resetForm(): void {
    this.selectedDepartmentId.set(null);
    this.departmentForm.reset({ name: '' });
  }

  private toPayload(): DepartmentCreateRequest {
    const rawValue = this.departmentForm.getRawValue();

    return {
      name: rawValue.name.trim()
    };
  }

  private getDepartmentId(department: Department): string | null {
    const id = department.departmentId;
    return id !== undefined && id !== null ? String(id) : null;
  }
}

