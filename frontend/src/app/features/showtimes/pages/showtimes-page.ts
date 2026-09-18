import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../../../core/models/movie.model';
import { Showtime } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { formatTime, toDateParam, today } from '../../../core/utils/date.utils';
import { DateNavigatorComponent } from '../../../shared/components/date-navigator.component';

@Component({
  selector: 'app-showtimes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateNavigatorComponent, RouterLink],
  template: `
    <div class="mx-auto max-w-5xl">
      <header class="mb-6">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Showtimes</h1>
        <p class="mt-1 text-slate-500">Pick a day to see what's showing.</p>
      </header>

      <div class="mb-8">
        <app-date-navigator (dateChange)="onDateChange($event)" />
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (item of placeholderCount; track $index) {
            <div class="h-28 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else if (shownMovies().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p class="text-slate-600">No showtimes on this day.</p>
        </div>
      } @else {
        <div class="space-y-6">
          @for (movie of shownMovies(); track movie.id) {
            <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center gap-4 border-b border-slate-100 p-4">
                <img
                  class="h-16 w-12 rounded-lg object-cover"
                  [src]="movie.posterUrl"
                  [alt]="movie.title"
                />
                <div>
                  <a
                    class="font-semibold text-slate-900 transition hover:text-violet-600"
                    [routerLink]="['/home/movies', movie.id]"
                  >
                    {{ movie.title }}
                  </a>
                  <p class="text-xs text-slate-500">{{ movie.duration_minutes }} min</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-3 p-4">
                @for (showtime of showtimesFor(movie.id); track showtime.id) {
                  <a
                    class="rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                    [routerLink]="['/home/showtimes', showtime.id]"
                  >
                    {{ formatTime(showtime.startTime) }}
                  </a>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `
})
export class ShowtimesPage {
  private readonly showtimeService = inject(ShowtimeService);
  private readonly movieService = inject(MovieService);

  readonly selectedDate = signal<Date>(today());
  readonly showtimes = signal<Showtime[]>([]);
  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 4 });
  readonly formatTime = formatTime;

  readonly shownMovies = computed(() => {
    const byMovie = new Map<number, Movie>();
    for (const showtime of this.showtimes()) {
      const movie = this.movies().find((m) => m.id === showtime.movie);
      if (movie) byMovie.set(movie.id, movie);
    }
    return Array.from(byMovie.values());
  });

  constructor() {
    void this.load();
  }

  showtimesFor(movieId: number): Showtime[] {
    return this.showtimes().filter((st) => st.movie === movieId);
  }

  async onDateChange(date: Date): Promise<void> {
    this.selectedDate.set(date);
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const date = toDateParam(this.selectedDate());
      const [showtimes, movies] = await Promise.all([
        lastValueFrom(this.showtimeService.getShowtimesByDate(date)),
        lastValueFrom(this.movieService.getMovies())
      ]);
      this.showtimes.set(showtimes);
      this.movies.set(movies);
    } catch {
      this.error.set('Failed to load showtimes. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}