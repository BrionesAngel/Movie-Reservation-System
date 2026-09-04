import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../../../core/models/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { Room, RoomService } from '../../../core/services/room.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-showtimes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-2xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Create showtime</h1>
        <p class="mt-1 text-slate-500">Schedule a new screening.</p>
      </header>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
      } @else {
        <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="movie">Movie</label>
            <select
              id="movie"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
              formControlName="movieId"
            >
              <option [ngValue]="null" disabled>Select a movie</option>
              @for (movie of movies(); track movie.id) {
                <option [ngValue]="movie.id">{{ movie.title }}</option>
              }
            </select>
            @if (form.controls.movieId.touched && form.controls.movieId.invalid) {
              <p class="mt-1 text-sm text-rose-700">Select a movie.</p>
            }
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="room">Room</label>
            <select
              id="room"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
              formControlName="roomId"
            >
              <option [ngValue]="null" disabled>Select a room</option>
              @for (room of rooms(); track room.id) {
                <option [ngValue]="room.id">Room {{ room.number }}</option>
              }
            </select>
            @if (form.controls.roomId.touched && form.controls.roomId.invalid) {
              <p class="mt-1 text-sm text-rose-700">Select a room.</p>
            }
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700" for="startTime">Start time</label>
              <input
                id="startTime"
                class="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                type="datetime-local"
                formControlName="startTime"
              />
              @if (form.controls.startTime.touched && form.controls.startTime.invalid) {
                <p class="mt-1 text-sm text-rose-700">A future start time is required.</p>
              }
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700" for="price">Price (MXN)</label>
              <input
                id="price"
                class="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                type="number"
                min="0.01"
                step="0.01"
                formControlName="price"
              />
              @if (form.controls.price.touched && form.controls.price.invalid) {
                <p class="mt-1 text-sm text-rose-700">Enter a price greater than 0.</p>
              }
            </div>
          </div>

          @if (error()) {
            <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
          }

          <button
            class="rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            type="submit"
            [disabled]="saving()"
          >
            {{ saving() ? 'Creating...' : 'Create showtime' }}
          </button>
        </form>
      }
    </div>
  `
})
export class AdminShowtimesPage {
  private readonly fb = inject(FormBuilder);
  private readonly movieService = inject(MovieService);
  private readonly roomService = inject(RoomService);
  private readonly showtimeService = inject(ShowtimeService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly movies = signal<Movie[]>([]);
  readonly rooms = signal<Room[]>([]);
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
      const [movies, rooms] = await Promise.all([
        lastValueFrom(this.movieService.getMovies()),
        lastValueFrom(this.roomService.getRooms())
      ]);
      this.movies.set(movies);
      this.rooms.set(rooms);
    } catch {
      this.error.set('Failed to load movies and rooms.');
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