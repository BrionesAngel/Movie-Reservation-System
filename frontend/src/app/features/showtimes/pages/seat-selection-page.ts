import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Reservation, ReservationResponse, ReservationStatus } from '../../reservations/models/reservation.model';
import { ShowtimeAndSeats } from '../models/showtime.model';
import { ReservationService } from '../../reservations/services/reservation.service';
import { ShowtimeService } from '../services/showtime.service';
import { formatDateTime } from '../../../core/utils/date.utils';
import { WebsocketService } from '../../../core/services/websocket.service';
import { SeatGridComponent } from '../components/seat-grid.component';

interface SeatEvent {
  type: 'SEAT_RESERVED' | 'SEAT_RELEASED';
  seatId: number;
}

@Component({
  selector: 'app-seat-selection-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SeatGridComponent, CurrencyPipe],
  templateUrl: './seat-selection-page.html',
})
export class SeatSelectionPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly showtimeService = inject(ShowtimeService);
  private readonly reservationService = inject(ReservationService);
  private readonly websocketService = inject(WebsocketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showtime = signal<ShowtimeAndSeats | null>(null);
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

  ngOnDestroy(): void {
    this.websocketService.disconnect();
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

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      this.websocketService.connect(token);
      this.websocketService
        .subscribeToShowtime(showtimeId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event: SeatEvent) => {
          if (event.type !== 'SEAT_RESERVED' && event.type !== 'SEAT_RELEASED') return;

          this.showtime.update((showtime) => {
            if (!showtime) return showtime;
            return {
              ...showtime,
              seats: showtime.seats.map((seat) =>
                seat.id === event.seatId
                  ? { ...seat, status: event.type === 'SEAT_RESERVED' ? 'RESERVED' : 'AVAILABLE' }
                  : seat
              )
            };
          });
        });
    } catch {
      this.error.set('Failed to load showtime. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private async refresh(showtimeId: number): Promise<void> {
    const showtime = await lastValueFrom(this.showtimeService.getShowtime(showtimeId));
    this.showtime.set(showtime);

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

  private navigateToPayment(reservation: Reservation | ReservationResponse): void {
    const showtime = this.showtime();
    const clientSecret = 'clientSecret' in reservation ? reservation.clientSecret : undefined;
    void this.router.navigate(['/home/reservations', reservation.id, 'payment'], {
      state: {
        ticket: {
          movieTitle: showtime?.movie.title,
          moviePosterUrl: showtime?.movie.posterUrl,
          roomNumber: showtime?.roomNumber,
          startTime: showtime?.startTime
        },
        clientSecret
      }
    });
  }
}
