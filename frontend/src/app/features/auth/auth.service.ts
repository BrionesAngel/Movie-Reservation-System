import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import {
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
  User
} from './types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly currentUser = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly accessToken = signal<string | null>(localStorage.getItem('accessToken'));
  readonly refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));

  private endpoint(path: string): string {
    return `${this.apiUrl}${path}`;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(this.endpoint('/api/auth/login'), credentials, { withCredentials: true }).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.currentUser.set(response.user);
      }),
      catchError((err) => {
        this.error.set(err?.error?.message ?? 'Unable to sign in.');
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(this.endpoint('/api/auth/register'), data, { withCredentials: true }).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.currentUser.set(response.user);
      }),
      catchError((err) => {
        this.error.set(err?.error?.message ?? 'Unable to complete registration.');
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearTokens();
      this.currentUser.set(null);
      this.error.set(null);
      return;
    }

    this.http.post<void>(
      this.endpoint('/api/auth/logout'),
      { refreshToken },
      { withCredentials: true }
    ).pipe(
      catchError(() => of(void 0))
    ).subscribe();

    this.clearTokens();
    this.currentUser.set(null);
    this.error.set(null);
  }

  currentUser$(): Observable<User | null> {
    this.loading.set(true);

    return this.http.get<User>(this.endpoint('/api/users/me'), { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.error.set(null);
      }),
      map((user) => user ?? null),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  refreshTokens(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.error.set('Your session expired. Please sign in again.');
      return throwError(() => new Error('Missing refresh token'));
    }

    return this.http.post<RefreshTokenResponse>(
      this.endpoint('/api/auth/refresh'),
      { refreshToken },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
      }),
      catchError((err) => {
        this.error.set('Your session expired. Please sign in again.');
        return throwError(() => err);
      })
    );
  }

  testApi(): Observable<string> {
    return this.http.get(this.endpoint('/api/test'), {
      withCredentials: true,
      responseType: 'text'
    });
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  getAccessToken(): string | null {
    return this.accessToken() ?? localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return this.refreshToken() ?? localStorage.getItem('refreshToken');
  }

  saveTokens(accessToken: string, refreshToken?: string | null): void {
    this.accessToken.set(accessToken);
    localStorage.setItem('accessToken', accessToken);

    if (refreshToken) {
      this.refreshToken.set(refreshToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
