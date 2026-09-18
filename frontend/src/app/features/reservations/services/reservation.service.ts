import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Reservation,
  ReservationPayment,
  ReservationRequest,
  ReservationResponse
} from '../models/reservation.model';

@Service()
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  createReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(
      `${this.apiUrl}/api/reservations/create`,
      request,
      { withCredentials: true }
    );
  }

  cancelReservation(reservationId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/api/reservations/${reservationId}/cancel`,
      null,
      { withCredentials: true }
    );
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/api/reservations/mine`, {
      withCredentials: true
    });
  }

  getReservationPayment(reservationId: number): Observable<ReservationPayment> {
    return this.http.get<ReservationPayment>(
      `${this.apiUrl}/api/reservations/${reservationId}/payment`,
      { withCredentials: true }
    );
  }

  getPaymentClientSecret(reservationId: number): Observable<{ clientSecret: string }> {
    return this.http.get<{ clientSecret: string }>(
      `${this.apiUrl}/api/reservations/${reservationId}/payment-intent`,
      { withCredentials: true }
    );
  }

  getAllReservations(date: string): Observable<Reservation[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Reservation[]>(`${this.apiUrl}/api/reservations`, {
      params,
      withCredentials: true
    });
  }
}