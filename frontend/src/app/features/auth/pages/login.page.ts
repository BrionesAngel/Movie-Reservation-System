import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../../../core/auth/auth.models';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loading = this.authService.loading;
  error = this.authService.error;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const credentials: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: async () => {
        await lastValueFrom(this.authService.currentUser$());
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        if (redirectTo) {
          this.router.navigateByUrl(redirectTo);
          return;
        }
        const user = this.authService.currentUser();
        const target = user?.role === 'ADMIN' ? '/admin/movies' : '/home/movies';
        this.router.navigate([target]);
      },
      error: () => {
        this.error.set('Credenciales inválidas');
        this.loading.set(false);
      }
    });
  }
}
