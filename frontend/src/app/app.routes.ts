import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () =>
			import('./features/auth/login/login.component').then(
				(m) => m.LoginComponent
			)
	},
	{
		path: 'register',
		loadComponent: () =>
			import('./features/auth/register/register.component').then(
				(m) => m.RegisterComponent
			)
	},
	{
		path: 'faculties/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin'] },
		loadComponent: () =>
			import('./features/faculties/admin/faculties-admin.component').then(
				(m) => m.FacultiesAdminComponent
			)
	},
	{
		path: 'faculties/view',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['faculty', 'admin'] },
		loadComponent: () =>
			import('./features/faculties/view/faculty-view.component').then(
				(m) => m.FacultyViewComponent
			)
	},
	{
		path: 'departments/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin'] },
		loadComponent: () =>
			import('./features/departments/admin/departments-admin.component').then(
				(m) => m.DepartmentsAdminComponent
			)
	},
	{
		path: 'departments/view',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin'] },
		loadComponent: () =>
			import('./features/departments/view/departments-view.component').then(
				(m) => m.DepartmentsViewComponent
			)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
