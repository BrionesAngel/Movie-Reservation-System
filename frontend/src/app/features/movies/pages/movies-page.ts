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
  template: `
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Now Playing</h1>
        <p class="mt-1 text-slate-500">Movies with upcoming showtimes.</p>
      </header>

      @if (moviesResource.isLoading()) {
        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          @for (item of placeholderCount; track $index) {
            <div class="aspect-2/3 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (moviesResource.error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load movies. Please try again.
        </p>
      } @else if (movies().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p class="text-slate-600">No movies are currently playing. Check back later.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          @for (movie of movies(); track movie.id) {
            <app-movie-card [movie]="movie" (selected)="openMovie($event)" />
          }
        </div>
      }
    </div>
  `
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
