import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Genre, MovieRequest } from '../../movies/models/movie.model';
import { GenreService } from '../../movies/services/genre.service';
import { MovieService } from '../../movies/services/movie.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-movie-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-movie-form-page.html',
})
export class AdminMovieFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieService = inject(MovieService);
  private readonly genreService = inject(GenreService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly genres = signal<Genre[]>([]);
  readonly selectedGenreIds = signal<Set<number>>(new Set());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(3000)]],
    durationMinutes: [0, [Validators.required, Validators.min(1)]],
    posterUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]]
  });

  readonly editing = () => Boolean(this.route.snapshot.paramMap.get('movieId'));
  private readonly movieId = Number(this.route.snapshot.paramMap.get('movieId'));

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      this.genres.set(await lastValueFrom(this.genreService.getGenres()));

      if (this.movieId) {
        const movie = await lastValueFrom(this.movieService.getMovie(this.movieId));
        this.form.patchValue({
          title: movie.title,
          description: movie.description,
          durationMinutes: movie.duration_minutes,
          posterUrl: movie.posterUrl
        });
        this.selectedGenreIds.set(new Set(movie.genres.map((g) => g.id)));
      }
    } catch {
      this.error.set('Failed to load movie data.');
    } finally {
      this.loading.set(false);
    }
  }

  isGenreSelected(id: number): boolean {
    return this.selectedGenreIds().has(id);
  }

  toggleGenre(id: number): void {
    const next = new Set(this.selectedGenreIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedGenreIds.set(next);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.selectedGenreIds().size === 0) return;

    this.saving.set(true);
    this.error.set(null);

    const request: MovieRequest = {
      title: this.form.controls.title.value,
      description: this.form.controls.description.value,
      durationMinutes: this.form.controls.durationMinutes.value,
      posterUrl: this.form.controls.posterUrl.value,
      genres: Array.from(this.selectedGenreIds())
    };

    try {
      if (this.movieId) {
        await lastValueFrom(this.movieService.updateMovie(this.movieId, request));
        this.uiFeedback.success('Movie updated.');
      } else {
        await lastValueFrom(this.movieService.addMovie(request));
        this.uiFeedback.success('Movie created.');
      }
      await this.router.navigate(['/admin/movies']);
    } catch (err) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Failed to save movie.';
      this.error.set(message);
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    void this.router.navigate(['/admin/movies']);
  }
}