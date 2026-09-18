import { ShowtimeSeatSummary } from './seat.model';

export interface ShowtimeMovie {
  id: number;
  title: string;
  posterUrl: string;
  duration_minutes: number;
}

export interface Showtime {
  id: number;
  movie: ShowtimeMovie;
  roomNumber: number;
  startTime: string;
  endTime: string;
  price: number;
}

export interface ShowtimeAndSeats extends Showtime {
  seats: ShowtimeSeatSummary[];
}

export interface CreateShowtimeRequest {
  movieId: number;
  roomId: number;
  startTime: string;
  price: number;
}
