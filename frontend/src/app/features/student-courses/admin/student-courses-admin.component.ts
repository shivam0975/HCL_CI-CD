import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { SessionService } from '../../../core/services/session.service';
import { StudentCourse, StudentCourseCreateRequest } from '../../../core/models/student-course.models';

@Component({
  selector: 'app-student-courses-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-courses-admin.component.html',
  styleUrl: './student-courses-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentCoursesAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly scService = inject(StudentCoursesService);
  private readonly sessionService = inject(SessionService);

  protected readonly items = signal<StudentCourse[]>([]);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly detailItem = signal<StudentCourse | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    id: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly scForm = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
    courseId: ['', Validators.required]
  });

  protected readonly pageTitle = computed(() =>
    this.selectedId() === null ? 'Enroll Student in Course' : `Edit Enrollment #${this.selectedId()}`
  );

  constructor() { this.load(); }

  protected load(): void {
    this.isLoading.set(true); this.message.set(null);
    this.scService.getAll().subscribe({
      next: (data) => this.items.set(data),
      error: () => { this.isSuccess.set(false); this.message.set('Failed to load enrollments.'); },
      complete: () => this.isLoading.set(false)
    });
  }

  protected save(): void {
    if (this.scForm.invalid || this.isSaving()) { this.scForm.markAllAsTouched(); return; }
    const v = this.scForm.getRawValue();
    const payload: StudentCourseCreateRequest = { 
      studentId: Number(v.studentId), 
      courseId: Number(v.courseId) 
    };
    const sid = this.selectedId();
    this.isSaving.set(true); 
    this.message.set(null);

    const obs = (sid === null) 
      ? this.scService.create(payload) 
      : this.scService.update(sid, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(sid === null ? 'Enrollment created.' : 'Enrollment updated.'); 
        this.resetForm(); 
        this.load(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(sid === null ? 'Failed to create enrollment.' : 'Failed to update enrollment.'); 
      }
    });
  }

  protected edit(item: StudentCourse): void {
    this.selectedId.set(item.id);
    this.scForm.setValue({ studentId: item.studentId != null ? String(item.studentId) : '', courseId: item.courseId != null ? String(item.courseId) : '' });
  }

  protected remove(item: StudentCourse): void {
    this.message.set(null);
    this.scService.delete(item.id).subscribe({
      next: () => { this.isSuccess.set(true); this.message.set(`Enrollment #${item.id} deleted.`); if (this.selectedId() === item.id) this.resetForm(); this.load(); },
      error: () => { this.isSuccess.set(false); this.message.set(`Failed to delete enrollment #${item.id}.`); }
    });
  }

  protected fetchById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) { this.detailForm.markAllAsTouched(); return; }
    const id = this.detailForm.controls.id.getRawValue();
    this.isFetchingDetail.set(true); this.message.set(null); this.detailItem.set(null);
    this.scService.getById(id).subscribe({
      next: (item) => this.detailItem.set(item),
      error: () => { this.isSuccess.set(false); this.message.set(`Enrollment #${id} not found.`); },
      complete: () => this.isFetchingDetail.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }
  protected resetForm(): void { this.selectedId.set(null); this.scForm.reset({ studentId: '', courseId: '' }); }
}
