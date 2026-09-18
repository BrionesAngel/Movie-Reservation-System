import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { formatTime, toDateParam, today } from '../../../core/utils/date.utils';
import { DateNavigatorComponent } from '../../../shared/components/date-navigator.component';
import { Showtime } from '../../showtimes/models/showtime.model';
import { ShowtimeService } from '../../showtimes/services/showtime.service';
import { Movie } from '../models/movie.model';
import { MovieService } from '../services/movie.service';

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
      } @else if (movieResource.isLoading()) {
        <div class="h-80 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else if (movieResource.error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load movie. Please try again.
        </p>
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

        @if (showtimesResource.isLoading()) {
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

  private readonly movieId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('movieId'))))
  );

  readonly selectedDate = signal<Date>(today());
  readonly formatTime = formatTime;

  readonly movieResource = httpResource<Movie>(() => {
    const movieId = this.movieId();
    if (!movieId) return undefined;
    return this.movieService.movieRequest(movieId);
  });

  readonly movie = computed<Movie | null>(() =>
    this.movieResource.hasValue() ? (this.movieResource.value() ?? null) : null
  );

  readonly showtimesResource = httpResource<Showtime[]>(() => {
    const movieId = this.movieId();
    if (!movieId) return undefined;
    return this.showtimeService.showtimesByMovieRequest(movieId, toDateParam(this.selectedDate()));
  });

  readonly showtimes = computed<Showtime[]>(() =>
    this.showtimesResource.hasValue() ? (this.showtimesResource.value() ?? []) : []
  );

  onDateChange(date: Date): void {
    this.selectedDate.set(date);
  }
}