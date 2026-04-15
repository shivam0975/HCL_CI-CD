import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly sessionService = inject(SessionService);
  protected readonly role = this.sessionService.role;

  protected readonly modules = [
    { title: 'Departments', desc: 'Manage departments', icon: '🏢', link: '/departments/admin', roles: ['admin'] },
    { title: 'Faculties', desc: 'Manage faculty members', icon: '👨‍🏫', link: '/faculties/admin', roles: ['admin'] },
    { title: 'Courses', desc: 'Manage courses', icon: '📚', link: '/courses/admin', roles: ['admin', 'faculty'] },
    { title: 'Students', desc: 'Manage students', icon: '🎓', link: '/students/admin', roles: ['admin', 'faculty'] },
    { title: 'Roles', desc: 'Manage system roles', icon: '🔑', link: '/roles/admin', roles: ['admin'] },
    { title: 'Users', desc: 'Manage user accounts', icon: '👤', link: '/users/admin', roles: ['admin'] },
    { title: 'Attendance', desc: 'Record & view attendance', icon: '📋', link: '/attendances/admin', roles: ['admin', 'faculty'] },
    { title: 'Course–Faculty', desc: 'Assign courses to faculty', icon: '🔗', link: '/course-faculties/admin', roles: ['admin'] },
    { title: 'Student–Courses', desc: 'Enroll students in courses', icon: '📝', link: '/student-courses/admin', roles: ['admin', 'faculty', 'student'] },
    { title: 'Dept View', desc: 'View departments', icon: '🏛️', link: '/departments/view', roles: ['admin', 'faculty', 'student'] },
    { title: 'Faculty View', desc: 'View faculty information', icon: '👁️', link: '/faculties/view', roles: ['admin', 'faculty', 'student'] }
  ];

  protected get visibleModules() {
    const currentRole = this.role();
    if (!currentRole) return [];
    return this.modules.filter(m => m.roles.includes(currentRole));
  }

  protected logout(): void { this.sessionService.clearSession(); }
}
