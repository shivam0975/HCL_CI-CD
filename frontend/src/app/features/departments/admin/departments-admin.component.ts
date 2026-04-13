import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

    this.departmentsService.getAll().subscribe({
      next: (data) => this.departments.set(data),
      error: () => {
        this.isSuccess.set(false);
        this.message.set('Failed to load departments list.');
      },
      complete: () => this.isLoading.set(false)
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

    if (selectedId === null) {
      this.departmentsService.create(payload).subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.message.set('Department created successfully.');
          this.resetForm();
          this.loadDepartments();
        },
        error: () => {
          this.isSuccess.set(false);
          this.message.set('Failed to create department.');
        },
        complete: () => this.isSaving.set(false)
      });
      return;
    }

    this.departmentsService.update(selectedId, payload).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set('Department updated successfully.');
        this.resetForm();
        this.loadDepartments();
      },
      error: () => {
        this.isSuccess.set(false);
        this.message.set('Failed to update department.');
      },
      complete: () => this.isSaving.set(false)
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
      next: (department) => this.detailDepartment.set(department),
      error: () => {
        this.isSuccess.set(false);
        this.message.set(`Department ${id} was not found.`);
      },
      complete: () => this.isFetchingDetail.set(false)
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
    return typeof department.departmentId === 'string' && department.departmentId.trim() !== ''
      ? department.departmentId
      : null;
  }
}
