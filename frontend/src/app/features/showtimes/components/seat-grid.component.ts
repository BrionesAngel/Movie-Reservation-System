import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ShowtimeSeatSummary } from '../../../core/models/seat.model';

@Component({
  selector: 'app-seat-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-1 py-4 shadow-sm sm:p-6">
      <div class="mb-6 flex justify-center">
        <div class="flex h-9 w-full items-center justify-center rounded-full bg-slate-200 text-xs font-semibold tracking-[0.35em] text-slate-500 uppercase sm:w-3/4">
          Screen
        </div>
      </div>

      <div class="space-y-2">
        @for (row of rows(); track row) {
          <div class="mx-auto flex w-fit items-center justify-center gap-1 sm:gap-2">
            <span class="w-3 shrink-0 text-center text-[10px] font-semibold text-slate-400 sm:w-4 sm:text-xs">{{ row }}</span>
            <div class="flex items-center justify-center gap-0.5 sm:gap-1.5">
              @for (seat of seatsByRow(row); track seat.id) {
                <button
                  class="aspect-square w-[clamp(16px,4.5vw,32px)] rounded-md text-[9px] font-semibold transition sm:w-8 sm:text-[10px]"
                  [class]="seatClass(seat)"
                  type="button"
                  [disabled]="seat.status !== 'AVAILABLE'"
                  (click)="toggleSeat(seat)"
                  [attr.aria-label]="'Seat ' + seat.row + seat.number"
                >
                  {{ seat.number }}
                </button>
              }
            </div>
          </div>
        }
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 sm:gap-4">
        <span class="flex items-center gap-1.5">
          <span class="h-3.5 w-3.5 rounded bg-slate-200"></span> Available
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3.5 w-3.5 rounded bg-violet-600"></span> Selected
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3.5 w-3.5 rounded bg-slate-400"></span> Occupied
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3.5 w-3.5 rounded bg-rose-400"></span> Blocked
        </span>
      </div>
    </div>
  `
})
export class SeatGridComponent {
  readonly seats = input.required<ShowtimeSeatSummary[]>();
  readonly selectionChange = output<Set<number>>();

  readonly selectedSeatIds = signal<Set<number>>(new Set());
  readonly selectedCount = computed(() => this.selectedSeatIds().size);

  readonly rows = computed(() => {
    const rowSet = new Set<string>();
    for (const seat of this.seats()) {
      rowSet.add(seat.row);
    }
    return Array.from(rowSet).sort();
  });

  toggleSeat(seat: ShowtimeSeatSummary): void {
    if (seat.status !== 'AVAILABLE') return;
    const next = new Set(this.selectedSeatIds());
    if (next.has(seat.id)) {
      next.delete(seat.id);
    } else {
      next.add(seat.id);
    }
    this.selectedSeatIds.set(next);
    this.selectionChange.emit(next);
  }

  seatsByRow(row: string): ShowtimeSeatSummary[] {
    return this.seats()
      .filter((seat) => seat.row === row)
      .sort((a, b) => a.number - b.number);
  }

  seatClass(seat: ShowtimeSeatSummary): string {
    if (this.selectedSeatIds().has(seat.id)) {
      return 'bg-violet-600 text-white cursor-pointer hover:bg-violet-500';
    }
    switch (seat.status) {
      case 'AVAILABLE':
        return 'bg-slate-200 text-slate-600 cursor-pointer hover:bg-violet-200';
      case 'RESERVED':
      case 'BOOKED':
        return 'bg-slate-400 text-white cursor-not-allowed';
      case 'BLOCKED':
        return 'bg-rose-400 text-white cursor-not-allowed';
    }
  }
}