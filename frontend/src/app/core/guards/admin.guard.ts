import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.currentUser()) {
    await lastValueFrom(authService.currentUser$());
  }

  if (authService.currentUser()?.role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/movies']);
};
