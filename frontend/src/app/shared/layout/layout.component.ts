import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { CINEMA_TIME_ZONE, nowInTimeZone } from '../../core/utils/date.utils';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
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
  readonly sidebarOpen = signal(false);
  readonly isDesktop = signal(true);

  readonly sidebarTransform = computed(() =>
    this.isDesktop() ? '' : (this.sidebarOpen() ? 'translateX(0)' : 'translateX(-100%)')
  );

  constructor() {
    this.updateCinemaTime();
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateCinemaTime());

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.sidebarOpen.set(false));

    const mql = window.matchMedia('(min-width: 64rem)');
    this.isDesktop.set(mql.matches);
    mql.addEventListener('change', (e) => this.isDesktop.set(e.matches));
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
