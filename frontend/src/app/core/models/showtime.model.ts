import { ShowtimeSeatSummary } from './seat.model';

export interface Showtime {
  id: number;
  movie: number;
  room: number;
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