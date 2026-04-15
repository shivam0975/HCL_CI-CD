import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { RolesService } from '../../../core/services/roles.service';
import { SessionService } from '../../../core/services/session.service';
import { Role, RoleCreateRequest } from '../../../core/models/role.models';

@Component({
  selector: 'app-roles-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './roles-admin.component.html',
  styleUrl: './roles-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);
  private readonly sessionService = inject(SessionService);

  protected readonly roles = signal<Role[]>([]);
  protected readonly selectedRoleId = signal<number | null>(null);
  protected readonly detailRole = signal<Role | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isFetchingDetail = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly detailForm = this.fb.nonNullable.group({
    roleId: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly roleForm = this.fb.nonNullable.group({
    roleName: ['', [Validators.required, Validators.minLength(2)]]
  });

  protected readonly pageTitle = computed(() =>
    this.selectedRoleId() === null ? 'Create Role' : `Edit Role #${this.selectedRoleId()}`
  );

  constructor() { this.loadRoles(); }

  protected loadRoles(): void {
    this.isLoading.set(true); 
    this.message.set(null);
    this.rolesService.getAll().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (data) => this.roles.set(data),
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set('Failed to load roles.'); 
      }
    });
  }

  protected saveRole(): void {
    if (this.roleForm.invalid || this.isSaving()) { this.roleForm.markAllAsTouched(); return; }
    const payload: RoleCreateRequest = { 
      roleName: this.roleForm.getRawValue().roleName.trim() 
    };
    const selectedId = this.selectedRoleId();
    this.isSaving.set(true); 
    this.message.set(null);

    const obs = (selectedId === null)
      ? this.rolesService.create(payload)
      : this.rolesService.update(selectedId, payload);

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => { 
        this.isSuccess.set(true); 
        this.message.set(selectedId === null ? 'Role created successfully.' : 'Role updated successfully.'); 
        this.resetForm(); 
        this.loadRoles(); 
      },
      error: () => { 
        this.isSuccess.set(false); 
        this.message.set(selectedId === null ? 'Failed to create role.' : 'Failed to update role.'); 
      }
    });
  }

  protected editRole(role: Role): void {
    this.selectedRoleId.set(role.roleId);
    this.roleForm.setValue({ roleName: role.roleName ?? '' });
  }

  protected deleteRole(role: Role): void {
    this.message.set(null);
    this.rolesService.delete(role.roleId).subscribe({
      next: () => { this.isSuccess.set(true); this.message.set(`Role #${role.roleId} deleted.`); if (this.selectedRoleId() === role.roleId) this.resetForm(); this.loadRoles(); },
      error: () => { this.isSuccess.set(false); this.message.set(`Failed to delete role #${role.roleId}.`); }
    });
  }

  protected fetchRoleById(): void {
    if (this.detailForm.invalid || this.isFetchingDetail()) { this.detailForm.markAllAsTouched(); return; }
    const id = this.detailForm.controls.roleId.getRawValue();
    this.isFetchingDetail.set(true); this.message.set(null); this.detailRole.set(null);
    this.rolesService.getById(id).subscribe({
      next: (r) => this.detailRole.set(r),
      error: () => { this.isSuccess.set(false); this.message.set(`Role #${id} not found.`); },
      complete: () => this.isFetchingDetail.set(false)
    });
  }

  protected logout(): void { this.sessionService.clearSession(); }
  protected resetForm(): void { this.selectedRoleId.set(null); this.roleForm.reset({ roleName: '' }); }
}
