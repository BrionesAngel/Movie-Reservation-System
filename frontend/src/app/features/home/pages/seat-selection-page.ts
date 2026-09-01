import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../../../core/models/movie.model';
import { ShowtimeAndSeats } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { formatDateTime } from '../../../core/utils/date.utils';
import { SeatGridComponent } from '../components/seat-grid.component';

@Component({
  selector: 'app-seat-selection-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SeatGridComponent, CurrencyPipe],
  template: `
    <div class="mx-auto max-w-4xl">
      @if (showtime(); as showtime) {
        <header class="mb-6">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ movie()?.title ?? 'Showtime' }}</h1>
          <p class="mt-1 text-slate-500">{{ formatDateTime(showtime.startTime) }}</p>
        </header>
      }

      @if (loading()) {
        <div class="h-96 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else if (seats().length > 0) {
        <app-seat-grid [seats]="seats()" (selectionChange)="onSelectionChange($event)" />

        <div class="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-slate-500">
              {{ selectedCount() }} seat{{ selectedCount() === 1 ? '' : 's' }} selected
            </p>
            @if (selectedLabels().length > 0) {
              <p class="text-sm font-medium text-slate-800">{{ selectedLabels() }}</p>
            }
            <p class="mt-1 text-lg font-semibold text-slate-900">
              {{ totalPrice() | currency }}
            </p>
          </div>
          <button
            class="rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-8 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            [disabled]="selectedCount() === 0 || reserving()"
            (click)="reserve()"
          >
            {{ reserving() ? 'Reserving...' : 'Reserve seats' }}
          </button>
        </div>
      }
    </div>
  `
})
export class SeatSelectionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly showtimeService = inject(ShowtimeService);
  private readonly movieService = inject(MovieService);
  private readonly reservationService = inject(ReservationService);

  readonly showtime = signal<ShowtimeAndSeats | null>(null);
  readonly movie = signal<Movie | null>(null);
  readonly seats = computed(() => this.showtime()?.seats ?? []);
  readonly selectedSeatIds = signal<Set<number>>(new Set());
  readonly loading = signal(true);
  readonly reserving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formatDateTime = formatDateTime;

  readonly selectedCount = computed(() => this.selectedSeatIds().size);
  readonly totalPrice = computed(() => (this.showtime()?.price ?? 0) * this.selectedCount());
  readonly selectedLabels = computed(() => {
    const labels = this.seats()
      .filter((seat) => this.selectedSeatIds().has(seat.id))
      .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
      .map((seat) => `${seat.row}${seat.number}`);
    return labels.join(', ');
  });

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    const showtimeId = Number(this.route.snapshot.paramMap.get('showtimeId'));
    if (!showtimeId) {
      this.error.set('Showtime not found.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    try {
      const showtime = await lastValueFrom(this.showtimeService.getShowtime(showtimeId));
      this.showtime.set(showtime);
      this.movie.set(await lastValueFrom(this.movieService.getMovie(showtime.movie)));
    } catch {
      this.error.set('Failed to load showtime. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onSelectionChange(ids: Set<number>): void {
    this.selectedSeatIds.set(ids);
  }

  async reserve(): Promise<void> {
    const showtime = this.showtime();
    if (!showtime || this.selectedCount() === 0) return;

    this.reserving.set(true);
    this.error.set(null);
    try {
      const reservation = await lastValueFrom(
        this.reservationService.createReservation({
          showtimeId: showtime.id,
          seatsId: Array.from(this.selectedSeatIds())
        })
      );
      this.reservationService.lastReservation.set(reservation);
      await this.router.navigate(['/home/reservations', reservation.id, 'payment']);
    } catch {
      this.error.set('Failed to create reservation. The seats may no longer be available.');
    } finally {
      this.reserving.set(false);
    }
  }
}