import { Routes } from '@angular/router';

export const SHOWTIMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/showtimes-page').then((m) => m.ShowtimesPage)
  },
  {
    path: ':showtimeId',
    loadComponent: () => import('./pages/seat-selection-page').then((m) => m.SeatSelectionPage)
  }
];
