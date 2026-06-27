import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';

import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';

import { authGuard } from './core/guards/auth-guard';

import { Login } from './features/auth/login/login';

import { Register } from './features/auth/register/register';

import { CreatePassword } from './features/auth/create-password/create-password';

import { AdminDashboard } from './features/dashboard/admin-dashboard/admin-dashboard';

import { DoctorDashboard } from './features/dashboard/doctor-dashboard/doctor-dashboard';

import { ReceptionistDashboard } from './features/dashboard/receptionist-dashboard/receptionist-dashboard';

import { EmployeeList } from './features/employees/employee-list/employee-list';
import { PatientList } from './features/patients/patient-list/patient-list';

import { AddEmployee } from './features/employees/add-employee/add-employee';

import { EmployeeDetails } from './features/employees/employee-details/employee-details';

import { EditEmployee } from './features/employees/edit-employee/edit-employee';

import { PendingEmployees } from './features/employees/pending-employees/pending-employees';

import { AddPatient } from './features/patients/add-patient/add-patient';
import { EditPatient } from './features/patients/edit-patient/edit-patient';

import { PatientDetails } from './features/patients/patient-details/patient-details';
import { BookAppointment } from './features/appointments/book-appointment/book-appointment';
import { AppointmentList } from './features/appointments/appointment-list/appointment-list';
import { EditAppointment } from './features/appointments/edit-appointment/edit-appointment';
import { DoctorQueue } from './features/appointments/doctor-queue/doctor-queue';
import { ConsultationForm } from './features/consultations/consultation-form/consultation-form';
import { ConsultationList } from './features/consultations/consultation-list/consultation-list';
import { DoctorAvailability } from './features/doctor/doctor-availability/doctor-availability';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { MyProfile } from './features/profile/my-profile/my-profile';
import { Home } from './features/floater/home/home';
import { nodeGuard } from './core/guards/node.guard';

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

      // =====================
      // Dashboards
      // =====================

      {
        path: 'dashboard/admin',
        component: AdminDashboard,
        canActivate: [nodeGuard]
      },

      {
        path: 'dashboard/doctor',
        component: DoctorDashboard,
        canActivate: [nodeGuard]
      },

      {
        path: 'dashboard/receptionist',
        component: ReceptionistDashboard,
        canActivate: [nodeGuard]
      },

      // =====================
      // Employees
      // =====================

      {
        path: 'employees',
        component: EmployeeList,
        canActivate: [nodeGuard]
      },

      {
        path: 'employees/create',
        component: AddEmployee,
        canActivate: [nodeGuard]
      },

      {
        path: 'employees/pending',
        component: PendingEmployees,
        canActivate: [nodeGuard]
      },

      // Internal pages
      {
        path: 'employees/:id',
        component: EmployeeDetails,
        canActivate: [nodeGuard],
        data: { nodePath: '/employees' }
      },

      {
        path: 'employees/edit/:id',
        component: EditEmployee,
        canActivate: [nodeGuard],
        data: { nodePath: '/employees' }
      },

      // =====================
      // Patients
      // =====================

      {
        path: 'patients',
        component: PatientList,
        canActivate: [nodeGuard]
      },

      {
        path: 'patients/create',
        component: AddPatient,
        canActivate: [nodeGuard]
      },

      // Internal pages
      {
        path: 'patients/:id',
        component: PatientDetails,
        canActivate: [nodeGuard],
        data: { nodePath: '/patients' }
      },

      {
        path: 'patients/edit/:id',
        component: EditPatient,
        canActivate: [nodeGuard],
        data: { nodePath: '/patients' }
      },

      // =====================
      // Appointments
      // =====================

      {
        path: 'appointments',
        component: AppointmentList,
        canActivate: [nodeGuard]
      },

      {
        path: 'appointments/book',
        component: BookAppointment,
        canActivate: [nodeGuard]
      },

      {
        path: 'appointments/requests',
        loadComponent: () =>
          import('./features/appointments/appointment-requests/appointment-requests').then(
            (m) => m.AppointmentRequestsComponent
          ),
        canActivate: [nodeGuard]
      },

      // Internal pages
      {
        path: 'appointments/edit/:id',
        component: EditAppointment,
        canActivate: [nodeGuard],
        data: { nodePath: '/appointments' }
      },

      // =====================
      // Doctor
      // =====================

      {
        path: 'doctor-queue',
        component: DoctorQueue,
        canActivate: [nodeGuard]
      },

      {
        path: 'doctor-availability',
        component: DoctorAvailability,
        canActivate: [nodeGuard]
      },

      // =====================
      // Consultations
      // =====================

      {
        path: 'health-records',
        loadComponent: () =>
          import('./features/health-records/health-record-list/health-record-list').then((m) => m.HealthRecordList),
        canActivate: [nodeGuard]
      },
      // Internal pages
      {
        path: 'consultation/:appointmentId',
        component: ConsultationForm,
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

      // =====================
      // Profile
      // =====================

      {
        path: 'my-profile',
        component: MyProfile,
        canActivate: [nodeGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
