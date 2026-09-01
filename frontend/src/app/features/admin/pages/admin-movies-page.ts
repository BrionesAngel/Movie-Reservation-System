import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Movie } from '../../../core/models/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-movies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-6xl">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Movies</h1>
          <p class="mt-1 text-slate-500">Manage the movie catalog.</p>
        </div>
        <a
          class="rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
          routerLink="/admin/movies/add"
        >
          Add movie
        </a>
      </header>

      @if (loading()) {
        <div class="space-y-3">
          @for (item of placeholderCount; track $index) {
            <div class="h-16 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else {
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-5 py-3">Movie</th>
                <th class="hidden px-5 py-3 md:table-cell">Duration</th>
                <th class="hidden px-5 py-3 lg:table-cell">Genres</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (movie of movies(); track movie.id) {
                <tr class="transition hover:bg-slate-50">
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <img class="h-12 w-9 rounded object-cover" [src]="movie.posterUrl" [alt]="movie.title" />
                      <span class="font-medium text-slate-900">{{ movie.title }}</span>
                    </div>
                  </td>
                  <td class="hidden px-5 py-3 text-slate-600 md:table-cell">{{ movie.duration_minutes }} min</td>
                  <td class="hidden px-5 py-3 lg:table-cell">
                    <div class="flex flex-wrap gap-1">
                      @for (genre of movie.genres; track genre.id) {
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ genre.name }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-3">
                    <div class="flex justify-end gap-2">
                      <a
                        class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white"
                        [routerLink]="['/admin/movies', movie.id, 'edit']"
                      >
                        Edit
                      </a>
                      <button
                        class="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        type="button"
                        (click)="remove(movie)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminMoviesPage {
  private readonly movieService = inject(MovieService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 5 });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.movies.set(await lastValueFrom(this.movieService.getMovies()));
    } catch {
      this.error.set('Failed to load movies.');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(movie: Movie): Promise<void> {
    const confirmed = await Swal.fire({
      title: 'Delete movie',
      text: `Are you sure you want to delete "${movie.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Delete'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await lastValueFrom(this.movieService.deleteMovie(movie.id));
      this.uiFeedback.success('Movie deleted.');
      this.movies.set(this.movies().filter((m) => m.id !== movie.id));
    } catch {
      this.uiFeedback.error('Failed to delete movie.');
    }
  }
}