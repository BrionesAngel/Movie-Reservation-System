import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../../../core/models/movie.model';
import { Showtime } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { toDateParam, today } from '../../../core/utils/date.utils';
import { MovieCardComponent } from '../../../shared/components/movie-card.component';

@Component({
  selector: 'app-movies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieCardComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Now Playing</h1>
        <p class="mt-1 text-slate-500">Movies with showtimes today.</p>
      </header>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          @for (item of placeholderCount; track $index) {
            <div class="aspect-2/3 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else if (movies().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p class="text-slate-600">No movies are currently playing. Check back later.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          @for (movie of movies(); track movie.id) {
            <app-movie-card [movie]="movie" />
          }
        </div>
      }
    </div>
  `
})
export class MoviesPage {
  private readonly movieService = inject(MovieService);
  private readonly showtimeService = inject(ShowtimeService);

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 8 });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [movies, todayShowtimes] = await Promise.all([
        lastValueFrom(this.movieService.getMovies()),
        lastValueFrom(this.showtimeService.getShowtimesByDate(toDateParam(today())))
      ]);

      const activeMovieIds = new Set(todayShowtimes.map((st: Showtime) => st.movie));
      this.movies.set(movies.filter((m: Movie) => activeMovieIds.has(m.id)));
    } catch {
      this.error.set('Failed to load movies. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
