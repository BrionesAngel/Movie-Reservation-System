import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../features/auth/auth.service';

@Component({
  selector: 'app-dashboard-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto mt-12 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      <p class="mt-3 text-slate-600">You are signed in successfully.</p>
      @if (apiMessage()) {
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {{ apiMessage() }}
        </div>
      }
      <button
        class="mt-6 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
        type="button"
        (click)="testApi()"
      >
        Call backend test endpoint
      </button>
      <button
        class="mt-6 ml-3 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
        type="button"
        (click)="logout()"
      >
        Sign out
      </button>
    </section>
  `
})
export class DashboardPlaceholderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly apiMessage = signal<string | null>(null);

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  testApi(): void {
    this.authService.testApi().subscribe({
      next: (message) => this.apiMessage.set(message),
      error: () => this.apiMessage.set('Backend test request failed.')
    });
  }
}
