import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Movie } from '../../../core/models/movie.model';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';import { ShowtimeAndSeats } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { Room, RoomService } from '../../../core/services/room.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { formatDateTime, nowInTimeZone, CINEMA_TIME_ZONE } from '../../../core/utils/date.utils';

interface ReservationView extends Reservation {
  statusLabel: string;
  statusClass: string;
  movie?: Movie;
  room?: Room;
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
                <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="text-sm font-semibold text-slate-600">
                    {{ reservation.startTime ? formatDateTime(reservation.startTime) : '' }}
                  </span>
                  @if (reservation.room; as room) {
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      Room {{ room.number }}
                    </span>
                  }
                  <span class="text-xs text-slate-400">
                    &middot; Created {{ formatDateTime(reservation.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-4 sm:flex-col sm:items-end">
                <p class="text-lg font-semibold text-slate-900">{{ reservation.totalPrice | currency }}</p>
                @if (reservation.status === 'RESERVED') {
                  <a
                    class="rounded-lg bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:brightness-110"
                    [routerLink]="['/home/reservations', reservation.id, 'payment']"
                  >
                    Pay
                  </a>
                }
                @if (canCancel(reservation)) {
                  <button
                    class="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
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
  private readonly roomService = inject(RoomService);

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
      const roomCache = new Map<number, Room>();

      const views: ReservationView[] = [];
      for (const reservation of reservations) {
        let movie: Movie | undefined;
        let room: Room | undefined;
        let startTime: string | undefined;

        try {
          let showtime = showtimeCache.get(reservation.showtimeId);
          if (!showtime) {
            showtime = await lastValueFrom(this.showtimeService.getShowtime(reservation.showtimeId));
            showtimeCache.set(reservation.showtimeId, showtime);
          }
          startTime = showtime.startTime;

          room = roomCache.get(showtime.room);
          if (!room) {
            room = await lastValueFrom(this.roomService.getRoom(showtime.room));
            roomCache.set(showtime.room, room);
          }

          movie = movieCache.get(showtime.movie);
          if (!movie) {
            movie = await lastValueFrom(this.movieService.getMovie(showtime.movie));
            movieCache.set(showtime.movie, movie);
          }
        } catch {
          // keep reservation visible without movie info
        }

        views.push({
          ...reservation,
          movie,
          room,
          startTime,
          ...statusMeta(reservation.status, reservation.paymentStatus)
        });
      }

      this.reservations.set(views);
    } catch {
      this.error.set('Failed to load your reservations.');
    } finally {
      this.loading.set(false);
    }
  }

  canCancel(reservation: ReservationView): boolean {
    if (reservation.status !== 'RESERVED' && reservation.status !== 'BOOKED') return false;
    if (!reservation.startTime) return false;
    const cinemaNow = nowInTimeZone(CINEMA_TIME_ZONE);
    return new Date(reservation.startTime).getTime() > cinemaNow.getTime();
  }

  async cancel(reservation: ReservationView): Promise<void> {
    const confirmed = await Swal.fire({
      title: 'Cancel reservation',
      text: `Are you sure you want to cancel ${reservation.seats.map((s) => s.row + s.number).join(', ')}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Cancel reservation'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await lastValueFrom(this.reservationService.cancelReservation(reservation.id));
      await this.load();
    } catch {
      this.error.set('Failed to cancel the reservation.');
    }
  }
}

function statusMeta(
  status: ReservationStatus,
  paymentStatus?: Reservation['paymentStatus']
): { statusLabel: string; statusClass: string } {
  if (status === 'CANCELED' && paymentStatus === 'REFUNDED') {
    return { statusLabel: 'Refunded', statusClass: 'bg-sky-100 text-sky-700' };
  }

  switch (status) {
    case 'RESERVED':
      return { statusLabel: 'Reserved', statusClass: 'bg-amber-100 text-amber-700' };
    case 'BOOKED':
      return { statusLabel: 'Booked', statusClass: 'bg-emerald-100 text-emerald-700' };
    case 'CANCELED':
      return { statusLabel: 'Canceled', statusClass: 'bg-slate-100 text-slate-500' };
  }
}