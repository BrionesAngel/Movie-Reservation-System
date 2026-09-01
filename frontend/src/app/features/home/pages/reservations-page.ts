import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../../../core/models/movie.model';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { ShowtimeAndSeats } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { formatDateTime } from '../../../core/utils/date.utils';

interface ReservationView extends Reservation {
  statusLabel: string;
  statusClass: string;
  movie?: Movie;
  startTime?: string;
}

@Component({
  selector: 'app-reservations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="mx-auto max-w-4xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">My Reservations</h1>
        <p class="mt-1 text-slate-500">Your booking history.</p>
      </header>

      @if (loading()) {
        <div class="space-y-4">
          @for (item of placeholderCount; track $index) {
            <div class="h-24 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else if (reservations().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p class="text-slate-600">You have no reservations yet.</p>
          <a class="mt-3 inline-block font-semibold text-violet-600 underline underline-offset-4" routerLink="/home/movies">
            Browse movies
          </a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (reservation of reservations(); track reservation.id) {
            <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              @if (reservation.movie) {
                <img
                  class="h-20 w-14 shrink-0 rounded-lg object-cover"
                  [src]="reservation.movie.posterUrl"
                  [alt]="reservation.movie.title"
                />
              } @else {
                <div class="h-20 w-14 shrink-0 rounded-lg bg-slate-100"></div>
              }

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h2 class="truncate font-semibold text-slate-900">{{ reservation.movie?.title ?? ('Showtime ' + reservation.showtimeId) }}</h2>
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="reservation.statusClass">
                    {{ reservation.statusLabel }}
                  </span>
                </div>
                <p class="mt-0.5 text-sm text-slate-500">
                  {{ reservation.seats.map((s) => s.row + s.number).join(', ') }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ reservation.startTime ? formatDateTime(reservation.startTime) : '' }}
                  &middot; Created {{ formatDateTime(reservation.createdAt) }}
                </p>
              </div>

              <div class="flex items-center gap-4 sm:flex-col sm:items-end">
                <p class="text-lg font-semibold text-slate-900">{{ reservation.totalPrice | currency }}</p>
                @if (reservation.status === 'RESERVED') {
                  <button
                    class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    type="button"
                    (click)="cancel(reservation)"
                  >
                    Cancel
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReservationsPage {
  private readonly reservationService = inject(ReservationService);
  private readonly showtimeService = inject(ShowtimeService);
  private readonly movieService = inject(MovieService);

  readonly reservations = signal<ReservationView[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 3 });
  readonly formatDateTime = formatDateTime;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const reservations = await lastValueFrom(this.reservationService.getMyReservations());

      const showtimeCache = new Map<number, ShowtimeAndSeats>();
      const movieCache = new Map<number, Movie>();

      const views: ReservationView[] = [];
      for (const reservation of reservations) {
        let movie: Movie | undefined;
        let startTime: string | undefined;

        try {
          let showtime = showtimeCache.get(reservation.showtimeId);
          if (!showtime) {
            showtime = await lastValueFrom(this.showtimeService.getShowtime(reservation.showtimeId));
            showtimeCache.set(reservation.showtimeId, showtime);
          }
          startTime = showtime.startTime;

          movie = movieCache.get(showtime.movie);
          if (!movie) {
            movie = await lastValueFrom(this.movieService.getMovie(showtime.movie));
            movieCache.set(showtime.movie, movie);
          }
        } catch {
          // keep reservation visible without movie info
        }

        views.push({ ...reservation, movie, startTime, ...statusMeta(reservation.status) });
      }

      this.reservations.set(views);
    } catch {
      this.error.set('Failed to load your reservations.');
    } finally {
      this.loading.set(false);
    }
  }

  async cancel(reservation: ReservationView): Promise<void> {
    await lastValueFrom(this.reservationService.cancelReservation(reservation.id));
    await this.load();
  }
}

function statusMeta(status: ReservationStatus): { statusLabel: string; statusClass: string } {
  switch (status) {
    case 'RESERVED':
      return { statusLabel: 'Reserved', statusClass: 'bg-amber-100 text-amber-700' };
    case 'BOOKED':
      return { statusLabel: 'Booked', statusClass: 'bg-emerald-100 text-emerald-700' };
    case 'CANCELED':
      return { statusLabel: 'Canceled', statusClass: 'bg-slate-100 text-slate-500' };
  }
}