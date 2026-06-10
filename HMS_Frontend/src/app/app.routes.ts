import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';

import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';

import { adminGuard } from './core/guards/admin-guard';

import { authGuard } from './core/guards/auth-guard';

import { Login } from './features/auth/login/login';

import { Register } from './features/auth/register/register';

import { CreatePassword } from './features/auth/create-password/create-password';
import { roleGuard } from './core/guards/role.guard';
import { AdminDashboard } from './features/dashboard/admin-dashboard/admin-dashboard';
import { doctorGuard } from './core/guards/doctor-guard';

import { receptionistGuard } from './core/guards/receptionist-guard';
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

export const routes: Routes = [
  /*
    |--------------------------------------------------------------------------
    | Home Route
    |--------------------------------------------------------------------------
    */
  {
    path: '',

    component: Home
  },

  /*
    |--------------------------------------------------------------------------
    | Auth Routes
    |--------------------------------------------------------------------------
    */
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

  /*
    |--------------------------------------------------------------------------
    | Protected Dashboard Routes
    |--------------------------------------------------------------------------
    */
  {
    path: '',

    component: DashboardLayout,

    canActivate: [authGuard],

    children: [
      /*
        |--------------------------------------------------------------------------
        | Default Redirect
        |--------------------------------------------------------------------------
        */
      {
        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full'
      },

      /*
  |--------------------------------------------------------------------------
  | Admin Dashboard
  |--------------------------------------------------------------------------
  */
      {
        path: 'dashboard/admin',

        component: AdminDashboard,
        canActivate: [adminGuard]
      },

      /*
        |--------------------------------------------------------------------------
        | Doctor Dashboard
        |--------------------------------------------------------------------------
        */
      {
        path: 'dashboard/doctor',

        component: DoctorDashboard,
        canActivate: [doctorGuard]
      },

      /*
        |--------------------------------------------------------------------------
        | Receptionist Dashboard
        |--------------------------------------------------------------------------
        */
      {
        path: 'dashboard/receptionist',

        component: ReceptionistDashboard,
        canActivate: [receptionistGuard]
      },

      /*
        |--------------------------------------------------------------------------
        | Employees
        |--------------------------------------------------------------------------
        */
      {
        path: 'employees',

        component: EmployeeList,

        canActivate: [adminGuard]
      },

      {
        path: 'employees/create',

        component: AddEmployee,

        canActivate: [adminGuard]
      },

      {
        path: 'employees/pending',

        component: PendingEmployees,

        canActivate: [adminGuard]
      },

      {
        path: 'employees/:id',

        component: EmployeeDetails,

        canActivate: [adminGuard]
      },

      {
        path: 'employees/edit/:id',

        component: EditEmployee,

        canActivate: [adminGuard]
      },

      /*
        |--------------------------------------------------------------------------
        | Patients
        |--------------------------------------------------------------------------
        */
      {
        path: 'patients/create',

        component: AddPatient
      },
      {
        path: 'patients',

        component: PatientList
      },
      {
        path: 'patients/edit/:id',

        component: EditPatient,

        canActivate: [roleGuard(['ADMIN', 'RECEPTIONIST'])]
      },
      {
        path: 'patients/:id',

        component: PatientDetails
      },
      {
        path: 'appointments/book',

        component: BookAppointment
      },
      {
        path: 'appointments',

        component: AppointmentList
      },
      {
        path: 'appointments/edit/:id',

        component: EditAppointment
      },
      {
        path: 'doctor-queue',

        component: DoctorQueue
      },
      {
        path: 'consultation/:appointmentId',

        component: ConsultationForm
      },
      {
        path: 'consultations',

        component: ConsultationList
      },
      {
        path: 'doctor-availability',

        component: DoctorAvailability
      },
      {
        path: 'my-profile',

        component: MyProfile
      },
      {
        path: 'consultations/:id',

        loadComponent: () =>
          import('./features/consultations/consultation-details/consultation-details').then(
            (m) => m.ConsultationDetails
          )
      }
    ]
  },

  /*
    |--------------------------------------------------------------------------
    | Wildcard Route
    |--------------------------------------------------------------------------
    */
  {
    path: '**',

    redirectTo: 'login'
  }
];
