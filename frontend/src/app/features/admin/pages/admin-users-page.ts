import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { AdminUser, UserService } from '../services/user.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './admin-users-page.html',
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
    const confirmed = await Swal.fire({
      title: 'Promote user',
      text: `Are you sure you want to promote "${user.username}" to admin?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      confirmButtonText: 'Promote'
    });

    if (!confirmed.isConfirmed) return;

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