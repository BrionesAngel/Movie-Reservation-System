import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Genre, MovieRequest } from '../../../core/models/movie.model';
import { GenreService } from '../../../core/services/genre.service';
import { MovieService } from '../../../core/services/movie.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-movie-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-2xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">{{ editing() ? 'Edit movie' : 'Add movie' }}</h1>
        <p class="mt-1 text-slate-500">Fill in the details below.</p>
      </header>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else {
        <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="title">Title</label>
            <input
              id="title"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
              type="text"
              formControlName="title"
            />
            @if (form.controls.title.touched && form.controls.title.invalid) {
              <p class="mt-1 text-sm text-rose-700">Title is required (max 150 chars).</p>
            }
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="description">Description</label>
            <textarea
              id="description"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
              rows="5"
              formControlName="description"
            ></textarea>
            @if (form.controls.description.touched && form.controls.description.invalid) {
              <p class="mt-1 text-sm text-rose-700">Description is required (max 3000 chars).</p>
            }
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700" for="duration">Duration (minutes)</label>
              <input
                id="duration"
                class="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                type="number"
                min="1"
                formControlName="durationMinutes"
              />
              @if (form.controls.durationMinutes.touched && form.controls.durationMinutes.invalid) {
                <p class="mt-1 text-sm text-rose-700">Enter a positive duration.</p>
              }
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700" for="posterUrl">Poster URL</label>
              <input
                id="posterUrl"
                class="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                type="url"
                placeholder="https://..."
                formControlName="posterUrl"
              />
              @if (form.controls.posterUrl.touched && form.controls.posterUrl.invalid) {
                <p class="mt-1 text-sm text-rose-700">Enter a valid URL.</p>
              }
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Genres</label>
            <div class="flex flex-wrap gap-2 rounded-xl border border-slate-300 p-4">
              @for (genre of genres(); track genre.id) {
                <label class="flex cursor-pointer items-center gap-1.5">
                  <input type="checkbox" [checked]="isGenreSelected(genre.id)" (change)="toggleGenre(genre.id)" />
                  <span class="text-sm text-slate-700">{{ genre.name }}</span>
                </label>
              }
            </div>
            @if (submitted() && selectedGenreIds().size === 0) {
              <p class="mt-1 text-sm text-rose-700">Select at least one genre.</p>
            }
          </div>

          @if (error()) {
            <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
          }

          <div class="flex gap-3 pt-2">
            <button
              class="rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              type="submit"
              [disabled]="saving()"
            >
              {{ saving() ? 'Saving...' : editing() ? 'Save changes' : 'Create movie' }}
            </button>
            <button
              class="rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
              (click)="goBack()"
            >
              Cancel
            </button>
          </div>
        </form>
      }
    </div>
  `
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