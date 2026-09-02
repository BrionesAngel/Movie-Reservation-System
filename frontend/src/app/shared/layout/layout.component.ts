import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-slate-100">
      <aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div class="flex h-16 items-center border-b border-slate-100 px-6">
          <span class="bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            Cinema
          </span>
        </div>

        <nav class="flex-1 space-y-1 px-3 py-4">
          <a
            routerLink="/home/movies"
            routerLinkActive="bg-violet-50 text-violet-700"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Movies
          </a>
          <a
            routerLink="/home/showtimes"
            routerLinkActive="bg-violet-50 text-violet-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Showtimes
          </a>
          <a
            routerLink="/home/reservations"
            routerLinkActive="bg-violet-50 text-violet-700"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            My Reservations
          </a>

          @if (isAdmin()) {
            <div class="pt-4">
              <p class="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</p>
              <a
                routerLink="/admin/movies"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Movies
              </a>
              <a
                routerLink="/admin/showtimes"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Showtimes
              </a>
              <a
                routerLink="/admin/reservations"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Reservations
              </a>
              <a
                routerLink="/admin/users"
                routerLinkActive="bg-violet-50 text-violet-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Users
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

  readonly user = this.authService.currentUser;
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly username = computed(() => this.user()?.username ?? '');
  readonly initial = computed(() => this.username().charAt(0).toUpperCase() || '?');
  readonly roleLabel = computed(() => (this.isAdmin() ? 'Admin' : 'User'));

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
