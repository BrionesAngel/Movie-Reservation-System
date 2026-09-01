import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { LayoutComponent } from '../../shared/layout/layout.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'movies'
      },
      {
        path: 'movies',
        loadComponent: () => import('./pages/movies-page').then((m) => m.MoviesPage)
      },
      {
        path: 'movies/:movieId',
        loadComponent: () => import('./pages/movie-detail-page').then((m) => m.MovieDetailPage)
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./pages/showtimes-page').then((m) => m.ShowtimesPage)
      },
      {
        path: 'showtimes/:showtimeId',
        loadComponent: () => import('./pages/seat-selection-page').then((m) => m.SeatSelectionPage)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/reservations-page').then((m) => m.ReservationsPage)
      },
      {
        path: 'reservations/:reservationId/payment',
        loadComponent: () => import('./pages/payment-page').then((m) => m.PaymentPage)
      }
    ]
  }
];