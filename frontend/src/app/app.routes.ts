import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	},
	{
		path: '',
		loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
	},
	{
		path: 'dashboard',
		canActivate: [authGuard],
		loadComponent: () => import('./shared/dashboard-placeholder.component').then((m) => m.DashboardPlaceholderComponent)
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
