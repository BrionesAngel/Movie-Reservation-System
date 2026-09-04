import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { CINEMA_TIME_ZONE, nowInTimeZone } from '../../core/utils/date.utils';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-slate-100">
      <aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div class="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
          <img
            class="h-10 w-auto shrink-0 object-contain"
            src="logo_movie_system.png"
            alt="Cinema logo"
          />
          <div class="min-w-0">
            <span class="bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Cinema
            </span>
            <p class="mt-1 text-sm font-medium tabular-nums leading-none text-slate-400">
              {{ cinemaTime() }} CDMX
            </p>
          </div>
        </div>

        <nav class="flex-1 space-y-1.5 px-3 py-4">
          <a
            routerLink="/home/movies"
            routerLinkActive="bg-violet-50 text-violet-700"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Movies
          </a>
          <a
            routerLink="/home/showtimes"
            routerLinkActive="bg-violet-50 text-violet-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Showtimes
          </a>
          <a
            routerLink="/home/reservations"
            routerLinkActive="bg-violet-50 text-violet-700"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            My Reservations
          </a>

          @if (isAdmin()) {
            <div class="mt-3 border-t border-slate-200 pt-4">
              <p class="mb-2 flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span class="inline-block h-3 w-1 rounded-full bg-linear-to-b from-violet-600 to-pink-500"></span>
                Admin
              </p>
              <a
                routerLink="/admin/movies"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Add Movie
              </a>
              <a
                routerLink="/admin/showtimes"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Add Showtime
              </a>
              <a
                routerLink="/admin/reservations"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                All Reservations
              </a>
              <a
                routerLink="/admin/users"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Manage Users
              </a>
            </div>
          }
        </nav>

        <div class="border-t border-slate-100 p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
              {{ initial() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-slate-900">{{ username() }}</p>
              <p class="truncate text-xs text-slate-500">{{ roleLabel() }}</p>
            </div>
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              type="button"
              (click)="logout()"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main class="ml-64 flex-1 px-8 py-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.authService.currentUser;
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly username = computed(() => this.user()?.username ?? '');
  readonly initial = computed(() => this.username().charAt(0).toUpperCase() || '?');
  readonly roleLabel = computed(() => (this.isAdmin() ? 'Admin' : 'User'));

  readonly cinemaTime = signal('');

  constructor() {
    this.updateCinemaTime();
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateCinemaTime());
  }

  private updateCinemaTime(): void {
    const now = nowInTimeZone(CINEMA_TIME_ZONE);
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (time !== this.cinemaTime()) {
      this.cinemaTime.set(time);
    }
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
