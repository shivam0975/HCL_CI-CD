import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { SessionService } from '../services/session.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const token = sessionService.token();

  if (!token) {
    return next(req);
  }

  const isAuthEndpoint =
    req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/register');

  if (isAuthEndpoint) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authorizedRequest);
};
