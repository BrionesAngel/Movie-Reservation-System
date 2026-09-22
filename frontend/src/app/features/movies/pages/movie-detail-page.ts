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
  templateUrl: './movie-detail-page.html',
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