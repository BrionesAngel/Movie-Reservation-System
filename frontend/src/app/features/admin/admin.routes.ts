import { Routes } from '@angular/router';

import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { LayoutComponent } from '../../shared/layout/layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'movies'
      },
      {
        path: 'movies',
        loadComponent: () => import('./pages/admin-movies-page').then((m) => m.AdminMoviesPage)
      },
      {
        path: 'movies/add',
        loadComponent: () => import('./pages/admin-movie-form-page').then((m) => m.AdminMovieFormPage)
      },
      {
        path: 'movies/:movieId/edit',
        loadComponent: () => import('./pages/admin-movie-form-page').then((m) => m.AdminMovieFormPage)
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./pages/admin-showtimes-page').then((m) => m.AdminShowtimesPage)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/admin-reservations-page').then((m) => m.AdminReservationsPage)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin-users-page').then((m) => m.AdminUsersPage)
      }
    ]
  }
];