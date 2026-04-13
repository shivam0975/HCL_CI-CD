import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DepartmentsService } from '../../../core/services/departments.service';
import { SessionService } from '../../../core/services/session.service';
import { Department } from '../../../core/models/department.models';

@Component({
  selector: 'app-departments-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './departments-view.component.html',
  styleUrl: './departments-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentsViewComponent {
  private readonly departmentsService = inject(DepartmentsService);
  private readonly sessionService = inject(SessionService);

  protected readonly isLoading = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly departments = signal<Department[]>([]);
  protected readonly selectedDepartment = signal<Department | null>(null);

  constructor() {
    this.loadDepartments();
  }

  protected loadDepartments(): void {
    this.isLoading.set(true);
    this.message.set(null);

    this.departmentsService.getAll().subscribe({
      next: (departments) => {
        this.departments.set(departments);
        if (this.selectedDepartment() === null && departments.length > 0) {
          this.selectedDepartment.set(departments[0]);
        }
      },
      error: () => {
        this.message.set('Unable to load departments for your account.');
      },
      complete: () => this.isLoading.set(false)
    });
  }

  protected viewDepartment(department: Department): void {
    this.selectedDepartment.set(department);
  }

  protected logout(): void {
    this.sessionService.clearSession();
  }
}
