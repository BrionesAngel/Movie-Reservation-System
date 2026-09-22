import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MovieCardComponent } from '../components/movie-card.component';
import { Movie } from '../models/movie.model';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-movies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieCardComponent],
  templateUrl: './movies-page.html',
})
export class MoviesPage {
  private readonly movieService = inject(MovieService);
  private readonly router = inject(Router);

  readonly moviesResource = httpResource<Movie[]>(() => this.movieService.upcomingMoviesRequest());
  readonly movies = computed<Movie[]>(() =>
    this.moviesResource.hasValue() ? (this.moviesResource.value() ?? []) : []
  );
  readonly placeholderCount = Array.from({ length: 8 });

  openMovie(movie: Movie): void {
    void this.router.navigate(['/home/movies', movie.id]);
  }
}
