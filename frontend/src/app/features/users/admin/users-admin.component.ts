import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { UsersService } from '../../../core/services/users.service';
import { SessionService } from '../../../core/services/session.service';
import { User, UserCreateRequest } from '../../../core/models/user.models';

@Component({
  selector: 'app-users-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly sessionService = inject(SessionService);

  protected readonly users = signal<User[]>([]);
  protected readonly selectedUserId = signal<number | null>(null);
  protected readonly detailUser = signal<User | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    userId: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly userForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: [''],
    roleId: [''],
    roleName: ['']
  });

  protected readonly pageTitle = computed(() =>
    this.selectedUserId() === null ? 'Create User' : `Edit User #${this.selectedUserId()}`
  );

  constructor() { this.loadUsers(); }

  protected loadUsers(): void {
    this.isLoading.set(true); 
    this.message.set(null);
    this.usersService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.users.set(data),
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set('Failed to load users.'); 
      }
    });
  }

  protected saveUser(): void {
    if (this.userForm.invalid || this.isSaving()) { this.userForm.markAllAsTouched(); return; }
    const v = this.userForm.getRawValue();
    const selectedId = this.selectedUserId();
    this.isSaving.set(true); 
    this.message.set(null);

    const payload: any = {
      username: v.username.trim(),
      password: v.password || undefined,
      role: v.roleId || v.roleName ? {
        roleId: v.roleId ? Number(v.roleId) : 0,
        roleName: v.roleName || undefined
      } : undefined
    };

    const obs = (selectedId === null)
      ? this.usersService.create(payload)
      : this.usersService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(selectedId === null ? 'User created successfully.' : 'User updated successfully.'); 
        this.resetForm(); 
        this.loadUsers(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(selectedId === null ? 'Failed to create user.' : 'Failed to update user.'); 
      }
    });
  }

  protected editUser(user: User): void {
    this.selectedUserId.set(user.userId);
    this.userForm.setValue({
      username: user.username ?? '',
      password: '',
      roleId: user.role?.roleId != null ? String(user.role.roleId) : '',
      roleName: user.role?.roleName ?? ''
    });
  }

  protected deleteUser(user: User): void {
    this.message.set(null);
    this.usersService.delete(user.userId).subscribe({
      next: () => { this.isSuccess.set(true); this.message.set(`User #${user.userId} deleted.`); if (this.selectedUserId() === user.userId) this.resetForm(); this.loadUsers(); },
      error: () => { this.isSuccess.set(false); this.message.set(`Failed to delete user #${user.userId}.`); }
    });
  }

  protected fetchUserById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) { this.detailForm.markAllAsTouched(); return; }
    const id = this.detailForm.controls.userId.getRawValue();
    this.isFetchingDetail.set(true); this.message.set(null); this.detailUser.set(null);
    this.usersService.getById(id).subscribe({
      next: (u) => this.detailUser.set(u),
      error: () => { this.isSuccess.set(false); this.message.set(`User #${id} not found.`); },
      complete: () => this.isFetchingDetail.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }
  protected resetForm(): void {
    this.selectedUserId.set(null);
    this.userForm.reset({ username: '', password: '', roleId: '', roleName: '' });
  }
}
