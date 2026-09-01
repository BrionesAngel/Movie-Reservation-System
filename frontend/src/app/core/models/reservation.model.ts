import { ShowtimeSeatSummary } from './seat.model';

export type ReservationStatus = 'RESERVED' | 'BOOKED' | 'CANCELED';

export interface Reservation {
  id: number;
  showtimeId: number;
  userId: number;
  seats: ShowtimeSeatSummary[];
  status: ReservationStatus;
  createdAt: string;
  reserveUntil: string;
  totalPrice: number;
}

export interface ReservationResponse extends Reservation {
  clientSecret: string;
}

export interface ReservationRequest {
  showtimeId: number;
  seatsId: number[];
}