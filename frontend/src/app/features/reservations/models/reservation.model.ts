import { ShowtimeSeatSummary } from '../../showtimes/models/seat.model';
import { ShowtimeMovie } from '../../showtimes/models/showtime.model';

export type ReservationStatus = 'RESERVED' | 'BOOKED' | 'CANCELED';

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';

export interface Reservation {
  id: number;
  showtimeId: number;
  userId: number;
  seats: ShowtimeSeatSummary[];
  status: ReservationStatus;
  paymentStatus?: PaymentStatus | null;
  createdAt: string;
  reserveUntil: string;
  totalPrice: number;
  movie?: ShowtimeMovie;
  roomNumber?: number;
  startTime?: string;
}

export interface ReservationPayment {
  id: number;
  userId: number;
  seats: ShowtimeSeatSummary[];
  status: ReservationStatus;
  paymentStatus?: PaymentStatus | null;
  createdAt: string;
  reserveUntil: string;
  totalPrice: number;
}

export interface ReservationResponse extends ReservationPayment {
  clientSecret: string;
}

export interface ReservationRequest {
  showtimeId: number;
  seatsId: number[];
}