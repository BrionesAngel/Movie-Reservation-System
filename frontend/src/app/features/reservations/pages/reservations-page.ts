import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Reservation, ReservationStatus } from '../models/reservation.model';
import { ReservationService } from '../services/reservation.service';
import { formatDateTime, nowInTimeZone, CINEMA_TIME_ZONE } from '../../../core/utils/date.utils';

interface ReservationView extends Reservation {
  statusLabel: string;
  statusClass: string;
}

@Component({
  selector: 'app-reservations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './reservations-page.html',
})
export class ReservationsPage {
  private readonly reservationService = inject(ReservationService);

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

      this.reservations.set(
        reservations.map((reservation) => ({
          ...reservation,
          ...statusMeta(reservation.status, reservation.paymentStatus)
        }))
      );
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