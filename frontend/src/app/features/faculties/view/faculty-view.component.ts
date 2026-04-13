import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FacultiesService } from '../../../core/services/faculties.service';
import { SessionService } from '../../../core/services/session.service';
import { Faculty } from '../../../core/models/faculty.models';

@Component({
  selector: 'app-faculty-view',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './faculty-view.component.html',
  styleUrl: './faculty-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacultyViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly facultiesService = inject(FacultiesService);
  private readonly sessionService = inject(SessionService);

  protected readonly isLoading = signal(false);
  protected readonly isListLoading = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly faculties = signal<Faculty[]>([]);
  protected readonly faculty = signal<Faculty | null>(null);

  protected readonly viewForm = this.fb.nonNullable.group({
    id: [1, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    this.loadFaculties();
  }

  protected loadFaculties(): void {
    this.isListLoading.set(true);
    this.message.set(null);

    this.facultiesService.getAll().pipe(finalize(() => this.isListLoading.set(false))).subscribe({
      next: (faculties) => {
        this.faculties.set(faculties);
        if (this.faculty() === null && faculties.length > 0) {
          this.faculty.set(faculties[0]);
        }
      },
      error: () => {
        this.message.set('Unable to load faculty members.');
      }
    });
  }

  protected loadFaculty(): void {
    if (this.viewForm.invalid || this.isLoading()) {
      this.viewForm.markAllAsTouched();
      return;
    }

    const id = this.viewForm.controls.id.getRawValue();
    this.isLoading.set(true);
    this.message.set(null);
    this.faculty.set(null);

    this.facultiesService.getById(id).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (result) => {
        this.faculty.set(result);
      },
      error: () => {
        this.message.set(`Faculty #${id} was not found.`);
      }
    });
  }

  protected viewFaculty(faculty: Faculty): void {
    this.faculty.set(faculty);
    this.viewForm.setValue({ id: this.getFacultyId(faculty) ?? 1 });
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

  protected logout(): void {
    this.sessionService.clearSession();
  }
}
