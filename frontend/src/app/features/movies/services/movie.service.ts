import { Service, inject } from '@angular/core';
import { HttpClient, HttpResourceRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Movie, MovieOption, MovieRequest } from '../models/movie.model';

@Service()
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/api/movies`, { withCredentials: true });
  }

  getMovieOptions(): Observable<MovieOption[]> {
    return this.http.get<MovieOption[]>(`${this.apiUrl}/api/movies/options`, { withCredentials: true });
  }

  upcomingMoviesRequest(): HttpResourceRequest {
    return { url: `${this.apiUrl}/api/movies/upcoming`, withCredentials: true };
  }

  getMovie(movieId: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/api/movies/${movieId}`, { withCredentials: true });
  }

  movieRequest(movieId: number): HttpResourceRequest {
    return { url: `${this.apiUrl}/api/movies/${movieId}`, withCredentials: true };
  }

  addMovie(request: MovieRequest): Observable<Movie> {
    return this.http.post<Movie>(`${this.apiUrl}/api/movies/add`, request, { withCredentials: true });
  }

  updateMovie(movieId: number, request: MovieRequest): Observable<Movie> {
    return this.http.patch<Movie>(`${this.apiUrl}/api/movies/${movieId}`, request, { withCredentials: true });
  }

  deleteMovie(movieId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/movies/${movieId}`, { withCredentials: true });
  }
}