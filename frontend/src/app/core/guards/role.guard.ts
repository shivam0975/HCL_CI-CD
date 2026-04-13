import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppRole, SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const roles = (route.data['roles'] as AppRole[] | undefined) ?? [];

  if (roles.length === 0 || sessionService.hasRole(roles)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
