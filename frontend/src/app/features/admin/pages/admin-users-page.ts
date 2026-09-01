import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AdminUser, UserService } from '../../../core/services/user.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="mx-auto max-w-4xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Users</h1>
        <p class="mt-1 text-slate-500">Promote users to admins.</p>
      </header>

      @if (loading()) {
        <div class="space-y-3">
          @for (item of placeholderCount; track $index) {
            <div class="h-14 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error() }}</p>
      } @else {
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-5 py-3">Username</th>
                <th class="hidden px-5 py-3 md:table-cell">Email</th>
                <th class="px-5 py-3">Role</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (user of users(); track user.id) {
                <tr class="transition hover:bg-slate-50">
                  <td class="px-5 py-3 font-medium text-slate-900">{{ user.username }}</td>
                  <td class="hidden px-5 py-3 text-slate-600 md:table-cell">{{ user.email }}</td>
                  <td class="px-5 py-3">
                    <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="user.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    @if (user.role === 'ADMIN') {
                      <span class="text-xs text-slate-400">Already admin</span>
                    } @else {
                      <button
                        class="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
                        type="button"
                        [disabled]="promoting()"
                        (click)="promote(user)"
                      >
                        Promote
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-5 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminUsersPage {
  private readonly userService = inject(UserService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly promoting = signal(false);
  readonly error = signal<string | null>(null);
  readonly placeholderCount = Array.from({ length: 4 });
  readonly adminCount = computed(() => this.users().filter((u) => u.role === 'ADMIN').length);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.users.set(await lastValueFrom(this.userService.getUsers()));
    } catch {
      this.error.set('Failed to load users.');
    } finally {
      this.loading.set(false);
    }
  }

  async promote(user: AdminUser): Promise<void> {
    this.promoting.set(true);
    try {
      await lastValueFrom(this.userService.promoteUser(user.id));
      this.uiFeedback.success(`${user.username} is now an admin.`);
      await this.load();
    } catch {
      this.uiFeedback.error(`Failed to promote ${user.username}.`);
    } finally {
      this.promoting.set(false);
    }
  }
}