import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { ReservationResponse } from '../../../core/models/reservation.model';
import { ReservationService } from '../../../core/services/reservation.service';
import { formatDateTime } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-payment-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="mx-auto max-w-lg">
      @if (reservation(); as reservation) {
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
export class PaymentPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);

  readonly reservation = signal<ReservationResponse | null>(null);
  readonly loading = signal(true);
  readonly processing = signal(false);
  readonly resolved = signal(false);
  readonly error = signal<string | null>(null);
  readonly formatDateTime = formatDateTime;

  readonly seatsLabel = computed(() =>
    this.reservation()?.seats
      .map((s) => `${s.row}${s.number}`)
      .sort()
      .join(', ') ?? ''
  );

  private stripe?: Stripe | null;
  private cardElement?: StripeCardElement;

  constructor() {
    void this.init();
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
    await this.router.navigate(['/home/reservations']);
  }
}