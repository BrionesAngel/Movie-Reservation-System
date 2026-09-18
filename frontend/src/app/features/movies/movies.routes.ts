import { Routes } from '@angular/router';

export const MOVIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/movies-page').then((m) => m.MoviesPage)
  },
  {
    path: ':movieId',
    loadComponent: () => import('./pages/movie-detail-page').then((m) => m.MovieDetailPage)
  }
];
