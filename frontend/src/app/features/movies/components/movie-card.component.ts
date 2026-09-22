import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Movie } from '../models/movie.model';

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
  readonly selected = output<Movie>();
}
