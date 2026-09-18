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
        loadChildren: () => import('../movies/movies.routes').then((m) => m.MOVIES_ROUTES)
      },
      {
        path: 'showtimes',
        loadChildren: () => import('../showtimes/showtimes.routes').then((m) => m.SHOWTIMES_ROUTES)
      },
      {
        path: 'reservations',
        loadChildren: () =>
          import('../reservations/reservations.routes').then((m) => m.RESERVATIONS_ROUTES)
      }
    ]
  }
];
