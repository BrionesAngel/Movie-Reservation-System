import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { Reservation } from '../../reservations/models/reservation.model';
import { ReservationService } from '../../reservations/services/reservation.service';
import { toDateParam, today } from '../../../core/utils/date.utils';
import { DateNavigatorComponent } from '../../../shared/components/date-navigator.component';

@Component({
  selector: 'app-admin-reservations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateNavigatorComponent, CurrencyPipe],
  templateUrl: './admin-reservations-page.html',
})
export class AdminReservationsPage {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 5 });
  readonly totalEarnings = computed(() =>
    this.reservations()
      .filter((r) => r.status === 'BOOKED')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  );
  readonly formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

  constructor() {
    void this.load();
  }

  async onDateChange(date: Date): Promise<void> {
    await this.load(date);
  }

  private async load(date = today()): Promise<void> {
    this.loading.set(true);
    try {
      this.reservations.set(
        await lastValueFrom(this.reservationService.getAllReservations(toDateParam(date)))
      );
    } catch {
      this.error.set('Failed to load reservations.');
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'Reserved';
      case 'BOOKED':
        return 'Booked';
      case 'CANCELED':
        return 'Canceled';
      default:
        return status;
    }
  }

  statusClass(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'bg-amber-100 text-amber-700';
      case 'BOOKED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELED':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  }
}