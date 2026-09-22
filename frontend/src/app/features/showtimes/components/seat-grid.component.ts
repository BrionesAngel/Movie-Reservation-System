import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ShowtimeSeatSummary } from '../models/seat.model';

@Component({
  selector: 'app-seat-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './seat-grid.component.html',
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