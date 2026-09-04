import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Movie } from '../../../core/models/movie.model';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { ShowtimeAndSeats } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { Room, RoomService } from '../../../core/services/room.service';
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
          @if (room(); as room) {
            <span class="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Room {{ room.number }}
            </span>
          }
        </header>
      }

      @if (loading()) {
        <div class="h-96 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else {
        @if (myReservations().length > 0) {
          <div class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Your current seats</h2>
            <div class="space-y-3">
              @for (r of myReservations(); track r.id) {
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="font-medium text-slate-900">{{ seatLabel(r) }}</span>
                    <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="statusClass(r.status)">
                      {{ statusLabel(r.status) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    @if (r.status === 'RESERVED') {
                      <button
                        class="rounded-lg bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        (click)="goToPay(r)"
                      >
                        Pay
                      </button>
                    }
                    <button
                      class="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      [disabled]="canceling()"
                      (click)="cancelReservation(r)"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (seats().length > 0) {
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
<div class="flex items-center justify-end gap-3">
            <button
              class="rounded-xl border border-slate-300 px-8 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              [disabled]="reserving()"
              (click)="cancelSelection()"
            >
              Cancel
            </button>
            <button
              class="rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-8 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              [disabled]="selectedCount() === 0 || reserving()"
              (click)="reserve()"
            >
              {{ reserving() ? 'Reserving...' : 'Reserve seats' }}
            </button>
          </div>
          </div>
        }
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
  private readonly roomService = inject(RoomService);

  readonly showtime = signal<ShowtimeAndSeats | null>(null);
  readonly movie = signal<Movie | null>(null);
  readonly room = signal<Room | null>(null);
  readonly seats = computed(() => this.showtime()?.seats ?? []);
  readonly myReservations = signal<Reservation[]>([]);
  readonly selectedSeatIds = signal<Set<number>>(new Set());
  readonly loading = signal(true);
  readonly reserving = signal(false);
  readonly canceling = signal(false);
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
      await this.refresh(showtimeId);
    } catch {
      this.error.set('Failed to load showtime. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private async refresh(showtimeId: number): Promise<void> {
    const showtime = await lastValueFrom(this.showtimeService.getShowtime(showtimeId));
    this.showtime.set(showtime);
    this.movie.set(await lastValueFrom(this.movieService.getMovie(showtime.movie)));
    this.room.set(await lastValueFrom(this.roomService.getRoom(showtime.room)));

    const mine = await lastValueFrom(this.reservationService.getMyReservations());
    this.myReservations.set(
      mine.filter(
        (r) => r.showtimeId === showtimeId && r.status !== 'CANCELED'
      )
    );
  }

  seatLabel(reservation: Reservation): string {
    return reservation.seats.map((s) => `${s.row}${s.number}`).sort().join(', ');
  }

  goToPay(reservation: Reservation): void {
    this.navigateToPayment(reservation);
  }

  statusLabel(status: ReservationStatus): string {
    switch (status) {
      case 'RESERVED':
        return 'Reserved';
      case 'BOOKED':
        return 'Booked';
      case 'CANCELED':
        return 'Canceled';
    }
  }

  statusClass(status: ReservationStatus): string {
    switch (status) {
      case 'RESERVED':
        return 'bg-amber-100 text-amber-700';
      case 'BOOKED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELED':
        return 'bg-slate-100 text-slate-500';
    }
  }

  async cancelReservation(reservation: Reservation): Promise<void> {
    const confirmed = await Swal.fire({
      title: 'Cancel reservation',
      text: `Are you sure you want to cancel ${this.seatLabel(reservation)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Cancel reservation'
    });

    if (!confirmed.isConfirmed) return;

    this.canceling.set(true);
    try {
      await lastValueFrom(this.reservationService.cancelReservation(reservation.id));
      const showtimeId = Number(this.route.snapshot.paramMap.get('showtimeId'));
      await this.refresh(showtimeId);
    } catch {
      this.error.set('Failed to cancel the reservation.');
    } finally {
      this.canceling.set(false);
    }
  }

  onSelectionChange(ids: Set<number>): void {
    this.selectedSeatIds.set(ids);
  }

  async cancelSelection(): Promise<void> {
    const confirmed = await Swal.fire({
      title: 'Cancel seat selection',
      text: 'Your selected seats will be released.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Cancel selection'
    });

    if (!confirmed.isConfirmed) return;

    this.selectedSeatIds.set(new Set());
    this.error.set(null);
    await this.router.navigate(['/home/showtimes']);
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
      this.navigateToPayment(reservation);
    } catch {
      this.error.set('Failed to create reservation. The seats may no longer be available.');
    } finally {
      this.reserving.set(false);
    }
  }

  private navigateToPayment(reservation: Reservation): void {
    void this.router.navigate(['/home/reservations', reservation.id, 'payment'], {
      state: {
        ticket: {
          movieTitle: this.movie()?.title,
          moviePosterUrl: this.movie()?.posterUrl,
          roomNumber: this.room()?.number,
          startTime: this.showtime()?.startTime
        }
      }
    });
  }
}