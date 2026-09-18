import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { ReservationResponse } from '../../../core/models/reservation.model';
import { ReservationService } from '../../../core/services/reservation.service';
import { formatDateTime } from '../../../core/utils/date.utils';

interface TicketInfo {
  movieTitle?: string;
  moviePosterUrl?: string;
  roomNumber?: number;
  startTime?: string;
}

@Component({
  selector: 'app-payment-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="mx-auto max-w-lg">
      @if (reservation(); as reservation) {
        @if (confirmed()) {
          <header class="mb-6 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg class="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Payment Confirmed</h1>
            <p class="mt-1 text-slate-500">Your reservation has been successfully booked.</p>
          </header>

          <div class="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="flex gap-4 p-6">
              @if (ticket()?.moviePosterUrl; as posterUrl) {
                <img
                  class="h-28 w-20 shrink-0 rounded-lg object-cover shadow-sm"
                  [src]="posterUrl"
                  [alt]="ticket()?.movieTitle ?? 'Movie poster'"
                />
              } @else {
                <div class="h-28 w-20 shrink-0 rounded-lg bg-slate-100"></div>
              }
              <div class="min-w-0">
                <h2 class="font-semibold text-slate-900">{{ ticket()?.movieTitle ?? ('Reservation #' + reservation.id) }}</h2>
                @if (ticket()?.startTime; as startTime) {
                  <div class="mt-3 space-y-1.5 text-sm">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-slate-500">Showtime</span>
                      <span class="font-medium text-slate-900">{{ formatDateTime(startTime) }}</span>
                    </div>
                    @if (ticket()?.roomNumber; as roomNumber) {
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-500">Room</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          Room {{ roomNumber }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="border-t border-dashed border-slate-200 bg-slate-50 px-6 py-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Seats</span>
                <span class="font-medium text-slate-900">{{ seatsLabel() }}</span>
              </div>
              <div class="mt-1.5 flex items-center justify-between text-sm">
                <span class="text-slate-500">Reservation</span>
                <span class="font-medium text-slate-900">#{{ reservation.id }}</span>
              </div>
              <div class="mt-1.5 flex items-center justify-between border-t border-slate-200 pt-2">
                <span class="font-medium text-slate-900">Total paid</span>
                <span class="text-lg font-semibold text-slate-900">{{ reservation.totalPrice | currency }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <a
              class="flex-1 rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-3 text-center font-semibold text-white transition hover:brightness-110"
              routerLink="/home/reservations"
            >
              View my reservations
            </a>
            <a
              class="flex-1 rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-600 transition hover:bg-slate-50"
              routerLink="/home/movies"
            >
              Browse movies
            </a>
          </div>
        } @else if (confirming()) {
          <header class="mb-6 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
              <svg class="h-8 w-8 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Confirming Payment</h1>
            <p class="mt-1 text-slate-500">This usually takes a few seconds.</p>
          </header>

          <div class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">Seats</span>
              <span class="font-medium text-slate-900">{{ seatsLabel() }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-100 pt-3">
              <span class="font-medium text-slate-900">Total</span>
              <span class="text-lg font-semibold text-slate-900">{{ reservation.totalPrice | currency }}</span>
            </div>
          </div>

          <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
            Please do not close this page while we confirm your payment.
          </div>

          @if (pollError()) {
            <div class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
              <p class="text-sm text-rose-700">{{ pollError() }}</p>
              <button
                class="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                type="button"
                (click)="retryPolling()"
              >
                Check again
              </button>
            </div>
          }
        } @else {
          <header class="mb-6">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Payment</h1>
            <p class="mt-1 text-slate-500">You have 5 minutes to complete your payment.</p>
          </header>

          <div class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">Seats</span>
              <span class="font-medium text-slate-900">{{ seatsLabel() }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">Reserved until</span>
              <span class="font-medium text-slate-900">{{ formatDateTime(reservation.reserveUntil) }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-100 pt-3">
              <span class="font-medium text-slate-900">Total</span>
              <span class="text-lg font-semibold text-slate-900">{{ reservation.totalPrice | currency }}</span>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label class="mb-3 block text-sm font-medium text-slate-700" for="card-element">Card details</label>
            <div id="card-element" class="rounded-lg border border-slate-300 px-3 py-3"></div>

            @if (error()) {
              <p class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
            }
            @if (processing()) {
              <p class="mt-4 text-sm text-slate-500">Processing payment...</p>
            }

            <div class="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                class="flex-1 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                [disabled]="processing() || resolved()"
                (click)="cancel()"
              >
                Cancel
              </button>
              <button
                class="flex-1 rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                [disabled]="processing() || resolved()"
                (click)="pay()"
              >
                {{ resolved() ? 'Payment submitted' : processing() ? 'Processing...' : 'Pay now' }}
              </button>
            </div>

            <p class="mt-4 text-center text-xs text-slate-400">
              Use test card 4242 4242 4242 4242, any future expiry, any CVC.
            </p>
          </div>
        }
      } @else if (loading()) {
        <div class="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else if (error()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p class="text-slate-600">{{ error() }}</p>
          <a class="mt-4 inline-block font-semibold text-violet-600 underline underline-offset-4" routerLink="/home/reservations">
            Go to my reservations
          </a>
        </div>
      }
    </div>
  `
})
export class PaymentPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);

  readonly reservation = signal<ReservationResponse | null>(null);
  readonly loading = signal(true);
  readonly processing = signal(false);
  readonly resolved = signal(false);
  readonly confirming = signal(false);
  readonly confirmed = signal(false);
  readonly error = signal<string | null>(null);
  readonly pollError = signal<string | null>(null);
  readonly formatDateTime = formatDateTime;

  readonly ticket = signal<TicketInfo | null>(
    (this.router.getCurrentNavigation()?.extras.state?.['ticket'] as TicketInfo) ??
      (history.state?.['ticket'] as TicketInfo) ??
      null
  );

  readonly seatsLabel = computed(() =>
    this.reservation()?.seats
      .map((s) => `${s.row}${s.number}`)
      .sort()
      .join(', ') ?? ''
  );

  private stripe?: Stripe | null;
  private cardElement?: StripeCardElement;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly POLL_INTERVAL = 2000;
  private readonly POLL_TIMEOUT = 30000;

  constructor() {
    void this.init();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private async init(): Promise<void> {
    const reservationId = Number(this.route.snapshot.paramMap.get('reservationId'));
    if (!reservationId) {
      this.error.set('No active reservation found for payment.');
      this.loading.set(false);
      return;
    }

    try {
      const reservation = await lastValueFrom(this.reservationService.getReservationPayment(reservationId));
      this.reservation.set(reservation);

      if (reservation.status === 'BOOKED') {
        this.confirmed.set(true);
        this.loading.set(false);
        return;
      }

      if (reservation.status === 'CANCELED') {
        this.error.set('This reservation has been canceled.');
        this.loading.set(false);
        return;
      }
    } catch {
      this.error.set('This reservation cannot be paid. It may have expired or no longer be available for payment.');
      this.loading.set(false);
      return;
    }

    try {
      this.stripe = await loadStripe(environment.stripePublicKey);
      if (!this.stripe) {
        this.error.set('Stripe failed to load. Please try again later.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
      if (typeof document !== 'undefined') {
        this.cardElement = this.stripe.elements().create('card');
        this.cardElement.mount('#card-element');
      }
    } catch {
      this.error.set('Stripe failed to load. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }

  async cancel(): Promise<void> {
    const reservation = this.reservation();
    if (!reservation || this.processing() || this.resolved()) return;

    const confirmed = await Swal.fire({
      title: 'Cancel reservation',
      text: `Are you sure you want to cancel this reservation for ${this.seatsLabel()}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Cancel reservation'
    });

    if (!confirmed.isConfirmed) return;

    this.processing.set(true);
    this.error.set(null);
    try {
      await lastValueFrom(this.reservationService.cancelReservation(reservation.id));
      await this.router.navigate(['/home/reservations'], {
        queryParams: { canceled: 'true' }
      });
    } catch {
      this.error.set('Failed to cancel the reservation.');
      this.processing.set(false);
    }
  }

  async pay(): Promise<void> {
    const stripe = this.stripe;
    const cardElement = this.cardElement;
    const reservation = this.reservation();
    if (!stripe || !cardElement || !reservation || this.processing() || this.resolved()) return;

    this.processing.set(true);
    this.error.set(null);

    const result = await stripe.confirmCardPayment(reservation.clientSecret, {
      payment_method: {
        card: cardElement
      }
    });

    if (result.error) {
      this.error.set(result.error.message ?? 'Payment failed. Please try again.');
      this.processing.set(false);
      return;
    }

    this.resolved.set(true);
    this.processing.set(false);
    this.confirming.set(true);
    this.startPolling(reservation.id);
  }

  retryPolling(): void {
    const reservation = this.reservation();
    if (!reservation) return;

    this.pollError.set(null);
    this.startPolling(reservation.id);
  }

  private startPolling(reservationId: number): void {
    this.stopPolling();

    this.pollTimer = setInterval(async () => {
      try {
        const updated = await lastValueFrom(this.reservationService.getReservationPayment(reservationId));
        this.reservation.set(updated);

        if (updated.status === 'BOOKED') {
          this.stopPolling();
          this.confirming.set(false);
          this.confirmed.set(true);
        } else if (updated.status === 'CANCELED') {
          this.stopPolling();
          this.confirming.set(false);
          this.error.set('Your reservation has been canceled.');
        }
      } catch {
        // silently retry on next interval
      }
    }, this.POLL_INTERVAL);

    this.pollTimeout = setTimeout(() => {
      this.stopPolling();
      if (this.confirming()) {
        this.pollError.set(
          'Payment confirmation is taking longer than expected. Your payment may still be processing.'
        );
      }
    }, this.POLL_TIMEOUT);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
  }
}
