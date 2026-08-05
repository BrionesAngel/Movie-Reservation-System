import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="min-h-screen bg-slate-100 px-4 py-12">
      <div class="mx-auto flex w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
        <h1 class="bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">Sign in</h1>

        <form class="mt-6 grid gap-4" [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <label class="text-sm font-medium text-slate-700" for="email">Email</label>
          <input
            id="email"
            class="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
            type="email"
            formControlName="email"
            autocomplete="email"
          />
          @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
            <p class="text-sm text-rose-700">Enter a valid email address.</p>
          }

          <label class="text-sm font-medium text-slate-700" for="password">Password</label>
          <input
            id="password"
            class="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
            type="password"
            formControlName="password"
            autocomplete="current-password"
          />
          @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
            <p class="text-sm text-rose-700">Enter a valid password.</p>
          }

          @if (error()) {
            <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
          }

          <button
            class="mt-2 rounded-lg bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            [disabled]="loginForm.invalid || loading()"
          >
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>

          <p class="text-sm text-slate-600">
            Don't have an account?
            <a class="font-semibold text-fuchsia-600 underline underline-offset-4" routerLink="/register">Create one</a>
          </p>
        </form>
      </div>
    </section>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = this.authService.loading;
  error = this.authService.error;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const credentials: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error.set('Credenciales inválidas');
        this.loading.set(false);
      }
    });
  }
}
