import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Movie } from '../../movies/models/movie.model';
import { MovieService } from '../../movies/services/movie.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-movies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './admin-movies-page.html',
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