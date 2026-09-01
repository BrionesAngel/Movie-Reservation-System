import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { Reservation } from '../../../core/models/reservation.model';
import { ReservationService } from '../../../core/services/reservation.service';
import { toDateParam, today } from '../../../core/utils/date.utils';
import { DateNavigatorComponent } from '../../../shared/components/date-navigator.component';

@Component({
  selector: 'app-admin-reservations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateNavigatorComponent, CurrencyPipe],
  template: `
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Reservations</h1>
        <p class="mt-1 text-slate-500">All reservations created on a day.</p>
      </header>

      <div class="mb-6">
        <app-date-navigator (dateChange)="onDateChange($event)" />
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (item of placeholderCount; track $index) {
            <div class="h-16 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else {
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-5 py-3">User</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3">Seats</th>
                <th class="hidden px-5 py-3 md:table-cell">Created at</th>
                <th class="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (reservation of reservations(); track reservation.id) {
                <tr class="transition hover:bg-slate-50">
                  <td class="px-5 py-3 text-slate-900">#{{ reservation.userId }}</td>
                  <td class="px-5 py-3">
                    <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="statusClass(reservation.status)">
                      {{ statusLabel(reservation.status) }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-slate-600">
                    {{ reservation.seats.map((s) => s.row + s.number).join(', ') || '—' }}
                  </td>
                  <td class="hidden px-5 py-3 text-slate-600 md:table-cell">{{ formatDateTime(reservation.createdAt) }}</td>
                  <td class="px-5 py-3 text-right font-medium text-slate-900">{{ reservation.totalPrice | currency }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-5 py-12 text-center text-slate-500">No reservations on this day.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminReservationsPage {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 5 });
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