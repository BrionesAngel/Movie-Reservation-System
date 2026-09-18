import { Routes } from '@angular/router';

export const RESERVATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/reservations-page').then((m) => m.ReservationsPage)
  },
  {
    path: ':reservationId/payment',
    loadComponent: () => import('./pages/payment-page').then((m) => m.PaymentPage)
  }
];
