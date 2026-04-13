import { Injectable, signal } from '@angular/core';

export type AppRole = 'admin' | 'faculty';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'app_role';

  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly role = signal<AppRole | null>(this.readRole());

  isAuthenticated(): boolean {
    return Boolean(this.token());
  }

  hasRole(allowedRoles: AppRole[]): boolean {
    const role = this.role();
    return role !== null && allowedRoles.includes(role);
  }

  setSession(token: string): AppRole | null {
    const role = this.extractRoleFromToken(token);

    if (role === null) {
      return null;
    }

    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    this.token.set(token);
    this.role.set(role);

    return role;
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.token.set(null);
    this.role.set(null);
  }

  private readRole(): AppRole | null {
    const value = localStorage.getItem(this.roleKey);
    const token = this.token();

    if (token) {
      const tokenRole = this.extractRoleFromToken(token);
      if (tokenRole !== null) {
        if (tokenRole !== value) {
          localStorage.setItem(this.roleKey, tokenRole);
        }

        return tokenRole;
      }
    }

    if (value === 'admin' || value === 'faculty') {
      return value;
    }

    return null;
  }

  private extractRoleFromToken(token: string): AppRole | null {
    const payload = this.parseJwtPayload(token);

    if (payload === null) {
      return null;
    }

    const directRole = this.normalizeRole(payload['role']);
    if (directRole !== null) {
      return directRole;
    }

    const schemaRole = this.normalizeRole(
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    );
    if (schemaRole !== null) {
      return schemaRole;
    }

    return this.normalizeRole(payload['roles']);
  }

  private parseJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const decoded = atob(padded);
      const parsed: unknown = JSON.parse(decoded);

      if (parsed !== null && typeof parsed === 'object') {
        return parsed as Record<string, unknown>;
      }

      return null;
    } catch {
      return null;
    }
  }

  private normalizeRole(roleValue: unknown): AppRole | null {
    if (typeof roleValue === 'string') {
      return this.toAppRole(roleValue);
    }

    if (Array.isArray(roleValue)) {
      for (const value of roleValue) {
        if (typeof value !== 'string') {
          continue;
        }

        const normalized = this.toAppRole(value);
        if (normalized !== null) {
          return normalized;
        }
      }
    }

    return null;
  }

  private toAppRole(value: string): AppRole | null {
    const normalized = value.trim().toLowerCase();

    if (normalized.includes('admin')) {
      return 'admin';
    }

    if (normalized.includes('faculty')) {
      return 'faculty';
    }

    return null;
  }
}
