export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  posterUrl: string;
  genres: Genre[];
}

export interface MovieRequest {
  title: string;
  description: string;
  durationMinutes: number;
  posterUrl: string;
  genres: number[];
}