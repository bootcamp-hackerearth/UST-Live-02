import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { CreatePassword } from './features/auth/create-password/create-password';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Home } from './features/floater/home/home';
import { nodeGuard } from './core/guards/node.guard';
import { roleGuard } from './core/guards/role.guard';
import {
  adminDashboardResolver,
  doctorDashboardResolver,
  receptionistDashboardResolver
} from './features/dashboard/dashboard.resolvers';
import {
  appointmentsResolver,
  employeesResolver,
  healthRecordsResolver,
  managementNodesResolver,
  pendingAppointmentsResolver,
  pendingEmployeesResolver,
  patientsResolver
} from './features/route-data.resolvers';

export const routes: Routes = [
  // Home Routes
  {
    path: '',
    component: Home
  },
  // Auth Routes
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      },
      {
        path: 'create-password',
        component: CreatePassword
      },
      {
        path: 'forgot-password',
        component: ForgotPassword
      },
      {
        path: 'reset-password',
        component: ResetPassword
      }
    ]
  },
  // Protected Dashboard Routes
  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard/admin',
        pathMatch: 'full'
      },
      // Dashboards
      {
        path: 'dashboard/admin',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
        canActivate: [nodeGuard],
        resolve: {
          dashboard: adminDashboardResolver
        }
      },
      {
        path: 'dashboard/doctor',
        loadComponent: () =>
          import('./features/dashboard/doctor-dashboard/doctor-dashboard').then((m) => m.DoctorDashboard),
        canActivate: [nodeGuard],
        resolve: {
          dashboard: doctorDashboardResolver
        }
      },
      {
        path: 'dashboard/receptionist',
        loadComponent: () =>
          import('./features/dashboard/receptionist-dashboard/receptionist-dashboard').then(
            (m) => m.ReceptionistDashboard
          ),
        canActivate: [nodeGuard],
        resolve: {
          dashboard: receptionistDashboardResolver
        }
      },
      // Employees
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employee-list/employee-list').then((m) => m.EmployeeList),
        canActivate: [nodeGuard],
        resolve: {
          employees: employeesResolver
        }
      },
      {
        path: 'employees/create',
        loadComponent: () => import('./features/employees/add-employee/add-employee').then((m) => m.AddEmployee),
        canActivate: [nodeGuard]
      },
      {
        path: 'employees/pending',
        loadComponent: () =>
          import('./features/employees/pending-employees/pending-employees').then((m) => m.PendingEmployees),
        canActivate: [nodeGuard],
        resolve: {
          pendingEmployees: pendingEmployeesResolver
        }
      },
      // Internal pages
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/employees/employee-details/employee-details').then((m) => m.EmployeeDetails),
        canActivate: [nodeGuard],
        data: { nodePath: '/employees' }
      },
      {
        path: 'employees/edit/:id',
        loadComponent: () => import('./features/employees/edit-employee/edit-employee').then((m) => m.EditEmployee),
        canActivate: [nodeGuard],
        data: { nodePath: '/employees' }
      },
      // Patients
      {
        path: 'patients',
        loadComponent: () => import('./features/patients/patient-list/patient-list').then((m) => m.PatientList),
        canActivate: [nodeGuard],
        resolve: {
          patients: patientsResolver
        }
      },
      {
        path: 'patients/create',
        loadComponent: () => import('./features/patients/add-patient/add-patient').then((m) => m.AddPatient),
        canActivate: [nodeGuard]
      },
      // Internal pages
      {
        path: 'patients/:id',
        loadComponent: () =>
          import('./features/patients/patient-details/patient-details').then((m) => m.PatientDetails),
        canActivate: [nodeGuard],
        data: { nodePath: '/patients' }
      },
      {
        path: 'patients/edit/:id',
        loadComponent: () => import('./features/patients/edit-patient/edit-patient').then((m) => m.EditPatient),
        canActivate: [nodeGuard],
        data: { nodePath: '/patients' }
      },
      // Appointments
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list').then((m) => m.AppointmentList),
        canActivate: [nodeGuard],
        resolve: {
          appointments: appointmentsResolver
        }
      },
      {
        path: 'appointments/book',
        loadComponent: () =>
          import('./features/appointments/book-appointment/book-appointment').then((m) => m.BookAppointment),
        canActivate: [nodeGuard]
      },
      {
        path: 'appointments/requests',
        loadComponent: () =>
          import('./features/appointments/appointment-requests/appointment-requests').then(
            (m) => m.AppointmentRequestsComponent
          ),
        canActivate: [nodeGuard],
        resolve: {
          pendingAppointments: pendingAppointmentsResolver
        }
      },
      // Internal pages
      {
        path: 'appointments/edit/:id',
        loadComponent: () =>
          import('./features/appointments/edit-appointment/edit-appointment').then((m) => m.EditAppointment),
        canActivate: [nodeGuard],
        data: { nodePath: '/appointments' }
      },
      // Doctor
      {
        path: 'doctor-queue',
        loadComponent: () => import('./features/appointments/doctor-queue/doctor-queue').then((m) => m.DoctorQueue),
        canActivate: [nodeGuard]
      },
      {
        path: 'doctor-availability',
        loadComponent: () =>
          import('./features/doctor/doctor-availability/doctor-availability').then((m) => m.DoctorAvailability),
        canActivate: [nodeGuard]
      },
      {
        path: 'node-management',
        loadComponent: () =>
          import('./features/node-management/node-management/node-management').then((m) => m.NodeManagement),
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        resolve: {
          nodes: managementNodesResolver
        }
      },
      // Consultations
      {
        path: 'health-records',
        loadComponent: () =>
          import('./features/health-records/health-record-list/health-record-list').then((m) => m.HealthRecordList),
        canActivate: [nodeGuard],
        resolve: {
          healthRecords: healthRecordsResolver
        }
      },
      // Internal pages
      {
        path: 'consultation/:appointmentId',
        loadComponent: () =>
          import('./features/consultations/consultation-form/consultation-form').then((m) => m.ConsultationForm),
        canActivate: [nodeGuard],
        data: { nodePath: '/doctor-queue' }
      },
      {
        path: 'health-records/:patientId',
        loadComponent: () =>
          import('./features/health-records/health-record-details/health-record-details').then(
            (m) => m.HealthRecordDetails
          ),
        canActivate: [nodeGuard],
        data: { nodePath: '/health-records' }
      },
      // Profile
      {
        path: 'my-profile',
        loadComponent: () => import('./features/profile/my-profile/my-profile').then((m) => m.MyProfile),
        canActivate: [nodeGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
