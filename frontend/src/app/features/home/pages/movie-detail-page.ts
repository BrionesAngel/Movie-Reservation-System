import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../../../core/models/movie.model';
import { Showtime } from '../../../core/models/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { formatTime, toDateParam, today } from '../../../core/utils/date.utils';
import { DateNavigatorComponent } from '../../../shared/components/date-navigator.component';

@Component({
  selector: 'app-movie-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateNavigatorComponent, RouterLink],
  template: `
    <div class="mx-auto max-w-5xl">
      @if (movie(); as movie) {
        <div class="flex flex-col gap-8 md:flex-row">
          <img
            class="h-80 w-56 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
            [src]="movie.posterUrl"
            [alt]="movie.title"
          />
          <div class="flex-1">
            <div class="flex flex-wrap gap-2">
              @for (genre of movie.genres; track genre.id) {
                <span class="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  {{ genre.name }}
                </span>
              }
            </div>
            <h1 class="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{{ movie.title }}</h1>
            <p class="mt-1 text-slate-500">{{ movie.duration_minutes }} minutes</p>
            <p class="mt-4 whitespace-pre-line leading-relaxed text-slate-700">{{ movie.description }}</p>
          </div>
        </div>
      } @else if (loading()) {
        <div class="h-80 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      }

      <section class="mt-10">
        <h2 class="mb-4 text-xl font-semibold text-slate-900">Showtimes</h2>
        <div class="mb-6">
          <app-date-navigator (dateChange)="onDateChange($event)" />
        </div>

        @if (showtimes().length === 0) {
          <p class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
            No showtimes on this day.
          </p>
        } @else {
          <div class="flex flex-wrap gap-3">
            @for (showtime of showtimes(); track showtime.id) {
              <a
                class="rounded-xl border border-violet-200 bg-violet-50 px-6 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                [routerLink]="['/home/showtimes', showtime.id]"
              >
                {{ formatTime(showtime.startTime) }}
              </a>
            }
          </div>
        }

        @if (showtimesLoading()) {
          <p class="mt-4 text-sm text-slate-500">Loading showtimes...</p>
        }
      </section>
    </div>
  `
})
export class MovieDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly showtimeService = inject(ShowtimeService);

  readonly movie = signal<Movie | null>(null);
  readonly showtimes = signal<Showtime[]>([]);
  readonly selectedDate = signal<Date>(today());
  readonly loading = signal(true);
  readonly showtimesLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formatTime = formatTime;

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    const movieId = Number(this.route.snapshot.paramMap.get('movieId'));
    if (!movieId) {
      this.error.set('Movie not found.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    try {
      this.movie.set(await lastValueFrom(this.movieService.getMovie(movieId)));
      await this.loadShowtimes();
    } catch {
      this.error.set('Failed to load movie. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async onDateChange(date: Date): Promise<void> {
    this.selectedDate.set(date);
    await this.loadShowtimes();
  }

  private async loadShowtimes(): Promise<void> {
    const movie = this.movie();
    if (!movie) return;

    this.showtimesLoading.set(true);
    try {
      const showtimes = await lastValueFrom(
        this.showtimeService.getShowtimesByDate(toDateParam(this.selectedDate()))
      );
      this.showtimes.set(showtimes.filter((st) => st.movie === movie.id));
    } catch {
      this.showtimes.set([]);
    } finally {
      this.showtimesLoading.set(false);
    }
  }
}