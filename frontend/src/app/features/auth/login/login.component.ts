import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);

  protected readonly isSubmitting = signal(false);
  protected readonly serverMessage = signal<string | null>(null);
  protected readonly isSuccess = signal(false);
  protected readonly authToken = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected readonly username = computed(() => this.loginForm.controls.username);
  protected readonly password = computed(() => this.loginForm.controls.password);

  protected submit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.serverMessage.set(null);
    this.authToken.set(null);

    const payload = this.toPayload();

    this.authService.login(payload).pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: (response) => {
        const token = response.token ?? null;

        if (token === null) {
          this.isSuccess.set(false);
          this.serverMessage.set('Login succeeded but no JWT token was returned by the API.');
          return;
        }

        const role = this.sessionService.setSession(token);
        if (role === null) {
          this.isSuccess.set(false);
          this.serverMessage.set('Unable to determine user role from JWT claims.');
          return;
        }

        this.isSuccess.set(true);
        this.serverMessage.set(response.message ?? 'Login request completed successfully.');
        this.authToken.set(token);

        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.isSuccess.set(false);
        this.serverMessage.set('Unable to login with the provided credentials.');
      }
    });
  }

  private toPayload(): LoginRequest {
    const rawValue = this.loginForm.getRawValue();

    return {
      username: rawValue.username.trim(),
      password: rawValue.password
    };
  }
}
