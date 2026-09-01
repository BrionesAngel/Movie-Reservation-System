import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a
      class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      [routerLink]="['/home/movies', movie().id]"
    >
      <div class="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
        @if (movie().posterUrl) {
          <img
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            [src]="movie().posterUrl"
            [alt]="movie().title"
            loading="lazy"
          />
        }
      </div>
      <div class="flex flex-1 flex-col gap-1 p-4">
        <h3 class="truncate font-semibold text-slate-900">{{ movie().title }}</h3>
        <p class="text-xs text-slate-500">{{ movie().duration_minutes }} min</p>
        @if (movie().genres.length) {
          <div class="mt-2 flex flex-wrap gap-1">
            @for (genre of movie().genres; track genre.id) {
              <span class="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                {{ genre.name }}
              </span>
            }
          </div>
        }
      </div>
    </a>
  `
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
}