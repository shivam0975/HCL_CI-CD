import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly isSubmitting = signal(false);
  protected readonly serverMessage = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleId: ['', Validators.required],
    roleName: ['']
  });

  protected readonly username = computed(() => this.registerForm.controls.username);
  protected readonly password = computed(() => this.registerForm.controls.password);
  protected readonly roleId = computed(() => this.registerForm.controls.roleId);

  protected submit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.serverMessage.set(null);

    const payload = this.toPayload();

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isSuccess.set(true);
        this.serverMessage.set(response.message ?? 'Registration completed successfully.');
        this.registerForm.reset({
          username: '',
          password: '',
          roleId: '',
          roleName: ''
        });
      },
      error: () => {
        this.isSuccess.set(false);
        this.serverMessage.set('Unable to register with the provided details. Please try again.');
      },
      complete: () => this.isSubmitting.set(false)
    });
  }

  protected openLogin(): void {
    this.router.navigateByUrl('/login');
  }

  private toPayload(): RegisterRequest {
    const rawValue = this.registerForm.getRawValue();

    return {
      username: rawValue.username.trim(),
      password: rawValue.password,
      roleId: rawValue.roleId.trim(),
      roleName: rawValue.roleName.trim() === '' ? null : rawValue.roleName.trim()
    };
  }
}
