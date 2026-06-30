import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';
import { LoginRequest, User } from '../../types';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen bg-slate-100 px-4 py-12">
      <div class="mx-auto flex w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
        <h1 class="bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">Sign in</h1>

        <form class="mt-6 grid gap-4" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="text-sm font-medium text-slate-700" for="email">Email</label>
          <input
            id="email"
            class="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
            type="email"
            formControlName="email"
            autocomplete="email"
          />
          @if (form.controls.email.touched && form.controls.email.invalid) {
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
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <p class="text-sm text-rose-700">Enter a valid password.</p>
          }

          @if (authError()) {
            <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ authError() }}</p>
          }

          <button
            class="mt-2 rounded-lg bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            [disabled]="loading()"
          >
            {{ loading() ? 'Signing in...' : submitLabel() }}
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitLabel = input('Sign in');
  readonly authenticated = output<User>();

  readonly loading = computed(() => this.authService.loading());
  readonly authError = computed(() => this.authService.error());

  readonly form: LoginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const credentials: LoginRequest = this.form.getRawValue();

    this.authService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authService.saveTokens(response.accessToken, response.refreshToken);
          this.authenticated.emit(response.user);
          void this.router.navigateByUrl('/dashboard');
        }
      });
  }
}
