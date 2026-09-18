import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieRequest } from '../models/movie.model';

@Service()
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/api/movies`, { withCredentials: true });
  }

  getMovie(movieId: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/api/movies/${movieId}`, { withCredentials: true });
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