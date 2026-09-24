import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';

export const SHOWTIMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/showtimes-page').then((m) => m.ShowtimesPage)
  },
  {
    path: ':showtimeId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/seat-selection-page').then((m) => m.SeatSelectionPage)
  }
];
