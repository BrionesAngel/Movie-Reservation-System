import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResourceRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Showtime, ShowtimeAndSeats, CreateShowtimeRequest } from '../models/showtime.model';

@Service()
export class ShowtimeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getShowtimesByDate(date: string): Observable<Showtime[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Showtime[]>(`${this.apiUrl}/api/showtimes`, {
      params,
      withCredentials: true
    });
  }

  showtimesByDateRequest(date: string): HttpResourceRequest {
    return {
      url: `${this.apiUrl}/api/showtimes`,
      params: new HttpParams().set('date', date),
      withCredentials: true
    };
  }

  showtimesByMovieRequest(movieId: number, date: string): HttpResourceRequest {
    return {
      url: `${this.apiUrl}/api/showtimes/movie/${movieId}`,
      params: new HttpParams().set('date', date),
      withCredentials: true
    };
  }

  getUpcomingShowtimes(): Observable<Showtime[]> {
    return this.http.get<Showtime[]>(`${this.apiUrl}/api/showtimes/upcoming`, {
      withCredentials: true
    });
  }

  getShowtime(showtimeId: number): Observable<ShowtimeAndSeats> {
    return this.http.get<ShowtimeAndSeats>(`${this.apiUrl}/api/showtimes/${showtimeId}`, {
      withCredentials: true
    });
  }

  createShowtime(request: CreateShowtimeRequest): Observable<Showtime> {
    return this.http.post<Showtime>(`${this.apiUrl}/api/showtimes/create`, request, {
      withCredentials: true
    });
  }
}