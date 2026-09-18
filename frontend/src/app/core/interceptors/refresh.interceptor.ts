import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';
import { RefreshTokenResponse } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { UiFeedbackService } from '../services/ui-feedback.service';


let refreshRequest$: Observable<RefreshTokenResponse> | null = null;

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function signOutLocally(
  authService: AuthService,
  router: Router,
  uiFeedback: UiFeedbackService
): void {
  authService.clearTokens();
  authService.currentUser.set(null);
  authService.error.set(null);
  void uiFeedback.sessionExpired();
  void router.navigateByUrl('/login');
}

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const uiFeedback = inject(UiFeedbackService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = authService.refreshTokens().pipe(
          shareReplay(1),
          finalize(() => {
            refreshRequest$ = null;
          })
        );
      }

      return refreshRequest$.pipe(
        switchMap((tokens) => {
          const retriedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${tokens.accessToken}`
            }
          });

          return next(retriedRequest);
        }),
        catchError((refreshError) => {
          signOutLocally(authService, router, uiFeedback);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
