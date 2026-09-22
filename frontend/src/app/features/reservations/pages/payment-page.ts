import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { ReservationPayment } from '../models/reservation.model';
import { ReservationService } from '../services/reservation.service';
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
  templateUrl: './payment-page.html',
})
export class PaymentPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);

  readonly reservation = signal<ReservationPayment | null>(null);
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

  private readonly clientSecret = signal<string | null>(
    (this.router.getCurrentNavigation()?.extras.state?.['clientSecret'] as string) ??
      (history.state?.['clientSecret'] as string) ??
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

    let clientSecret = this.clientSecret();
    if (!clientSecret) {
      try {
        const intent = await lastValueFrom(this.reservationService.getPaymentClientSecret(reservation.id));
        clientSecret = intent.clientSecret;
        this.clientSecret.set(clientSecret);
      } catch {
        this.error.set('Unable to start the payment. Please try again.');
        this.processing.set(false);
        return;
      }
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
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
