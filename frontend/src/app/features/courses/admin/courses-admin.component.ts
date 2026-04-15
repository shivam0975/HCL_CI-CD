import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CoursesService } from '../../../core/services/courses.service';
import { SessionService } from '../../../core/services/session.service';
import { Course, CourseCreateRequest } from '../../../core/models/course.models';

@Component({
  selector: 'app-courses-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './courses-admin.component.html',
  styleUrl: './courses-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoursesAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly coursesService = inject(CoursesService);
  private readonly sessionService = inject(SessionService);

  protected readonly courses = signal<Course[]>([]);
  protected readonly selectedCourseId = signal<number | null>(null);
  protected readonly detailCourse = signal<Course | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    courseId: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly courseForm = this.fb.nonNullable.group({
    courseName: ['', [Validators.required, Validators.minLength(2)]],
    courseCode: [''],
    credits: [''],
    semester: [''],
    departmentId: ['']
  });

  protected readonly pageTitle = computed(() =>
    this.selectedCourseId() === null ? 'Create Course' : `Edit Course #${this.selectedCourseId()}`
  );

  constructor() {
    this.loadCourses();
  }

  protected loadCourses(): void {
    this.isLoading.set(true);
    this.message.set(null);
    this.coursesService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.courses.set(data),
      error: () => { this.isSuccess.set(false); this.message.set('Failed to load courses.'); }
    });
  }

  protected saveCourse(): void {
    if (this.courseForm.invalid || this.isSaving()) { this.courseForm.markAllAsTouched(); return; }
    const payload = this.toPayload();
    const selectedId = this.selectedCourseId();
    this.isSaving.set(true);
    this.message.set(null);

    const obs = (selectedId === null)
      ? this.coursesService.create(payload)
      : this.coursesService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(selectedId === null ? 'Course created successfully.' : 'Course updated successfully.'); 
        this.resetForm(); 
        this.loadCourses(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(selectedId === null ? 'Failed to create course.' : 'Failed to update course.'); 
      }
    });
  }

  protected editCourse(course: Course): void {
    this.selectedCourseId.set(course.courseId);
    this.courseForm.setValue({
      courseName: course.courseName ?? '',
      courseCode: course.courseCode ?? '',
      credits: course.credits != null ? String(course.credits) : '',
      semester: course.semester != null ? String(course.semester) : '',
      departmentId: course.departmentId != null ? String(course.departmentId) : ''
    });
  }

  protected deleteCourse(course: Course): void {
    this.message.set(null);
    this.coursesService.delete(course.courseId).subscribe({
      next: () => { this.isSuccess.set(true); this.message.set(`Course #${course.courseId} deleted.`); if (this.selectedCourseId() === course.courseId) this.resetForm(); this.loadCourses(); },
      error: () => { this.isSuccess.set(false); this.message.set(`Failed to delete course #${course.courseId}.`); }
    });
  }

  protected fetchCourseById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) { this.detailForm.markAllAsTouched(); return; }
    const id = this.detailForm.controls.courseId.getRawValue();
    this.isFetchingDetail.set(true); this.message.set(null); this.detailCourse.set(null);
    this.coursesService.getById(id).subscribe({
      next: (c) => this.detailCourse.set(c),
      error: () => { this.isSuccess.set(false); this.message.set(`Course #${id} not found.`); },
      complete: () => this.isFetchingDetail.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }

  protected resetForm(): void {
    this.selectedCourseId.set(null);
    this.courseForm.reset({ courseName: '', courseCode: '', credits: '', semester: '', departmentId: '' });
  }

  private toPayload(): CourseCreateRequest {
    const v = this.courseForm.getRawValue();
    return {
      courseName: v.courseName.trim(),
      courseCode: v.courseCode.trim() || undefined,
      credits: v.credits ? Number(v.credits) : undefined,
      semester: v.semester ? Number(v.semester) : undefined,
      departmentId: v.departmentId ? Number(v.departmentId) : undefined
    };
  }
}
