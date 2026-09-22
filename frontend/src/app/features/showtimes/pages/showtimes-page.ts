import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Showtime, ShowtimeMovie } from '../models/showtime.model';
import { ShowtimeService } from '../services/showtime.service';
import { formatTime, toDateParam, today } from '../../../core/utils/date.utils';
import { DateNavigatorComponent } from '../../../shared/components/date-navigator.component';

interface ShowtimeGroup {
  movie: ShowtimeMovie;
  showtimes: Showtime[];
}

@Component({
  selector: 'app-showtimes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateNavigatorComponent, RouterLink],
  templateUrl: './showtimes-page.html',
})
export class ShowtimesPage {
  private readonly showtimeService = inject(ShowtimeService);

  readonly selectedDate = signal<Date>(today());
  readonly placeholderCount = Array.from({ length: 4 });
  readonly formatTime = formatTime;

  readonly showtimesResource = httpResource<Showtime[]>(() =>
    this.showtimeService.showtimesByDateRequest(toDateParam(this.selectedDate()))
  );

  readonly showtimes = computed<Showtime[]>(() =>
    this.showtimesResource.hasValue() ? (this.showtimesResource.value() ?? []) : []
  );

  readonly groups = computed<ShowtimeGroup[]>(() => {
    const groups = new Map<number, ShowtimeGroup>();
    for (const showtime of this.showtimes()) {
      const group = groups.get(showtime.movie.id) ?? { movie: showtime.movie, showtimes: [] };
      group.showtimes.push(showtime);
      groups.set(showtime.movie.id, group);
    }
    return Array.from(groups.values());
  });

  onDateChange(date: Date): void {
    this.selectedDate.set(date);
  }
}
