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
		path: 'dashboard',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./features/dashboard/dashboard.component').then(
				(m) => m.DashboardComponent
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
		data: { roles: ['admin', 'faculty', 'student'] },
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
		data: { roles: ['admin', 'faculty', 'student'] },
		loadComponent: () =>
			import('./features/departments/view/departments-view.component').then(
				(m) => m.DepartmentsViewComponent
			)
	},
	{
		path: 'courses/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin', 'faculty'] },
		loadComponent: () =>
			import('./features/courses/admin/courses-admin.component').then(
				(m) => m.CoursesAdminComponent
			)
	},
	{
		path: 'students/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin', 'faculty'] },
		loadComponent: () =>
			import('./features/students/admin/students-admin.component').then(
				(m) => m.StudentsAdminComponent
			)
	},
	{
		path: 'roles/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin'] },
		loadComponent: () =>
			import('./features/roles/admin/roles-admin.component').then(
				(m) => m.RolesAdminComponent
			)
	},
	{
		path: 'users/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin'] },
		loadComponent: () =>
			import('./features/users/admin/users-admin.component').then(
				(m) => m.UsersAdminComponent
			)
	},
	{
		path: 'attendances/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin', 'faculty'] },
		loadComponent: () =>
			import('./features/attendances/admin/attendances-admin.component').then(
				(m) => m.AttendancesAdminComponent
			)
	},
	{
		path: 'course-faculties/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin'] },
		loadComponent: () =>
			import('./features/course-faculties/admin/course-faculties-admin.component').then(
				(m) => m.CourseFacultiesAdminComponent
			)
	},
	{
		path: 'student-courses/admin',
		canActivate: [authGuard, roleGuard],
		data: { roles: ['admin', 'faculty', 'student'] },
		loadComponent: () =>
			import('./features/student-courses/admin/student-courses-admin.component').then(
				(m) => m.StudentCoursesAdminComponent
			)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
