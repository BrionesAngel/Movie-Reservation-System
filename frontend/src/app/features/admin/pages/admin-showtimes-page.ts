import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { MovieOption } from '../../movies/models/movie.model';
import { MovieService } from '../../movies/services/movie.service';
import { ShowtimeService } from '../../showtimes/services/showtime.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-showtimes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-showtimes-page.html',
})
export class AdminShowtimesPage {
  private readonly fb = inject(FormBuilder);
  private readonly movieService = inject(MovieService);
  private readonly showtimeService = inject(ShowtimeService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly movies = signal<MovieOption[]>([]);
  readonly roomNumbers = [1, 2, 3, 4, 5];
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    movieId: [null as number | null, [Validators.required]],
    roomId: [null as number | null, [Validators.required]],
    startTime: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]]
  });

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      this.movies.set(await lastValueFrom(this.movieService.getMovieOptions()));
    } catch {
      this.error.set('Failed to load movies.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const startTime = this.form.controls.startTime.value;

    try {
      await lastValueFrom(
        this.showtimeService.createShowtime({
          movieId: this.form.controls.movieId.value!,
          roomId: this.form.controls.roomId.value!,
          startTime,
          price: this.form.controls.price.value
        })
      );
      this.uiFeedback.success('Showtime created.');
      this.form.reset();
    } catch (err) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Failed to create showtime.';
      this.error.set(message);
    } finally {
      this.saving.set(false);
    }
  }
}