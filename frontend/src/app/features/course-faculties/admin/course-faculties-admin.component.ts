import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CourseFacultiesService } from '../../../core/services/course-faculties.service';
import { SessionService } from '../../../core/services/session.service';
import { CourseFaculty, CourseFacultyCreateRequest } from '../../../core/models/course-faculty.models';

@Component({
  selector: 'app-course-faculties-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-faculties-admin.component.html',
  styleUrl: './course-faculties-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseFacultiesAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cfService = inject(CourseFacultiesService);
  private readonly sessionService = inject(SessionService);

  protected readonly items = signal<CourseFaculty[]>([]);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly detailItem = signal<CourseFaculty | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    id: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly cfForm = this.fb.nonNullable.group({
    courseId: ['', Validators.required],
    facultyId: ['', Validators.required]
  });

  protected readonly pageTitle = computed(() =>
    this.selectedId() === null ? 'Assign Course to Faculty' : `Edit Assignment #${this.selectedId()}`
  );

  constructor() { this.load(); }

  protected load(): void {
    this.isLoading.set(true); 
    this.message.set(null);
    this.cfService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.items.set(data),
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set('Failed to load assignments.'); 
      }
    });
  }

  protected save(): void {
    if (this.cfForm.invalid || this.isSaving()) { this.cfForm.markAllAsTouched(); return; }
    const v = this.cfForm.getRawValue();
    const payload: CourseFacultyCreateRequest = { 
      courseId: Number(v.courseId), 
      facultyId: Number(v.facultyId) 
    };
    const sid = this.selectedId();
    this.isSaving.set(true); 
    this.message.set(null);

    const obs = (sid === null)
      ? this.cfService.create(payload)
      : this.cfService.update(sid, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(sid === null ? 'Assignment created.' : 'Assignment updated.'); 
        this.resetForm(); 
        this.load(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(sid === null ? 'Failed to create assignment.' : 'Failed to update assignment.'); 
      }
    });
  }

  protected edit(item: CourseFaculty): void {
    this.selectedId.set(item.id);
    this.cfForm.setValue({ courseId: item.courseId != null ? String(item.courseId) : '', facultyId: item.facultyId != null ? String(item.facultyId) : '' });
  }

  protected remove(item: CourseFaculty): void {
    this.message.set(null);
    this.cfService.delete(item.id).subscribe({
      next: () => { this.isSuccess.set(true); this.message.set(`Assignment #${item.id} deleted.`); if (this.selectedId() === item.id) this.resetForm(); this.load(); },
      error: () => { this.isSuccess.set(false); this.message.set(`Failed to delete assignment #${item.id}.`); }
    });
  }

  protected fetchById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) { this.detailForm.markAllAsTouched(); return; }
    const id = this.detailForm.controls.id.getRawValue();
    this.isFetchingDetail.set(true); this.message.set(null); this.detailItem.set(null);
    this.cfService.getById(id).subscribe({
      next: (item) => this.detailItem.set(item),
      error: () => { this.isSuccess.set(false); this.message.set(`Assignment #${id} not found.`); },
      complete: () => this.isFetchingDetail.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }
  protected resetForm(): void { this.selectedId.set(null); this.cfForm.reset({ courseId: '', facultyId: '' }); }
}
