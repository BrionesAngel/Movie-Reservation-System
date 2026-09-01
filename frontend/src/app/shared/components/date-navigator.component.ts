import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { addDays, today } from '../../core/utils/date.utils';

@Component({
  selector: 'app-date-navigator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        type="button"
        (click)="move(-1)"
        aria-label="Previous day"
      >
        <span class="text-2xl leading-none">&lsaquo;</span>
      </button>

      <div class="flex items-baseline gap-2 text-center">
        <span class="text-lg font-semibold text-slate-900">{{ dayLabel() }}</span>
        <span class="text-sm text-slate-500">{{ dateLabel() }}</span>
        @if (isToday()) {
          <span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Today</span>
        }
      </div>

      <button
        class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        type="button"
        (click)="move(1)"
        aria-label="Next day"
      >
        <span class="text-2xl leading-none">&rsaquo;</span>
      </button>
    </div>
  `
})
export class DateNavigatorComponent {
  readonly selectedDate = signal<Date>(today());
  readonly dateChange = output<Date>();

  readonly isToday = computed(() => this.selectedDate().toDateString() === today().toDateString());
  readonly dayLabel = computed(() =>
    this.selectedDate().toLocaleDateString('en-US', { weekday: 'long' })
  );
  readonly dateLabel = computed(() =>
    this.selectedDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );

  move(delta: number): void {
    this.selectedDate.set(addDays(this.selectedDate(), delta));
    this.dateChange.emit(this.selectedDate());
  }
}