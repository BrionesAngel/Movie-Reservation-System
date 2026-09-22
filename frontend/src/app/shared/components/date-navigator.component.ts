import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { addDays, today } from '../../core/utils/date.utils';

@Component({
  selector: 'app-date-navigator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './date-navigator.component.html',
})
export class DateNavigatorComponent {
  readonly selectedDate = signal<Date>(today());
  readonly dateChange = output<Date>();
  readonly allowBack = input(false);

  readonly isToday = computed(() => this.selectedDate().toDateString() === today().toDateString());
  readonly canGoBack = computed(() => this.allowBack() || !this.isToday());
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