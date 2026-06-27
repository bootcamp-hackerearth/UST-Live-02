import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';

import { menuAccessGuard } from './core/guards/menu-access.guard';

export const routes: Routes = [
  // Home Routes
  {
    path: '',

    loadComponent: () =>
      import('./features/floater/home/home').then((m) => m.Home),

    pathMatch: 'full'
  },

  // Auth Routes
  {
    path: '',

    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),

    children: [
      {
        path: 'login',

        loadComponent: () =>
          import('./features/auth/login/login').then((m) => m.Login)
      },

      {
        path: 'register',

        loadComponent: () =>
          import('./features/auth/register/register').then((m) => m.Register)
      },

      {
        path: 'create-password',

        loadComponent: () =>
          import('./features/auth/create-password/create-password').then(
            (m) => m.CreatePassword
          )
      },
      {
        path: 'forgot-password',

        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password').then(
            (m) => m.ForgotPassword
          )
      },

      {
        path: 'reset-password',

        loadComponent: () =>
          import('./features/auth/reset-password/reset-password').then(
            (m) => m.ResetPassword
          )
      }
    ]
  },

  // Protected Dashboard Routes
    
  {
    path: '',

    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then(
        (m) => m.DashboardLayout
      ),

    canActivate: [authGuard],

    children: [
    
      {
        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full'
      },

   // Admin Dashboard

      {
        path: 'dashboard/admin',

        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard
          ),
        canActivate: [menuAccessGuard('/dashboard/admin')]
      },

     // Doctor Dashboard
      {
        path: 'dashboard/doctor',

        loadComponent: () =>
          import('./features/dashboard/doctor-dashboard/doctor-dashboard').then(
            (m) => m.DoctorDashboard
          ),
        canActivate: [menuAccessGuard('/dashboard/doctor')]
      },

      // Receptionist Dashboard
      {
        path: 'dashboard/receptionist',

        loadComponent: () =>
          import(
            './features/dashboard/receptionist-dashboard/receptionist-dashboard'
          ).then((m) => m.ReceptionistDashboard),
        canActivate: [menuAccessGuard('/dashboard/receptionist')]
      },

    //Employees
      {
        path: 'employees',

        loadComponent: () =>
          import('./features/employees/employee-list/employee-list').then(
            (m) => m.EmployeeList
          ),

        canActivate: [menuAccessGuard('/employees')]
      },

      {
        path: 'employees/create',

        loadComponent: () =>
          import('./features/employees/add-employee/add-employee').then(
            (m) => m.AddEmployee
          ),

        canActivate: [menuAccessGuard('/employees/create')]
      },

      {
        path: 'employees/pending',

        loadComponent: () =>
          import(
            './features/employees/pending-employees/pending-employees'
          ).then((m) => m.PendingEmployees),

        canActivate: [menuAccessGuard('/employees/pending')]
      },

      {
        path: 'employees/:id',

        loadComponent: () =>
          import('./features/employees/employee-details/employee-details').then(
            (m) => m.EmployeeDetails
          ),

        canActivate: [menuAccessGuard('/employees')]
      },

      {
        path: 'employees/edit/:id',

        loadComponent: () =>
          import('./features/employees/edit-employee/edit-employee').then(
            (m) => m.EditEmployee
          ),

        canActivate: [menuAccessGuard('/employees')]
      },

    // Patients
      {
        path: 'patients/create',

        loadComponent: () =>
          import('./features/patients/add-patient/add-patient').then(
            (m) => m.AddPatient
          ),

        canActivate: [menuAccessGuard('/patients/create')]
      },
      {
        path: 'patients',

        loadComponent: () =>
          import('./features/patients/patient-list/patient-list').then(
            (m) => m.PatientList
          ),

        canActivate: [menuAccessGuard('/patients')]
      },
      {
        path: 'patients/edit/:id',

        loadComponent: () =>
          import('./features/patients/edit-patient/edit-patient').then(
            (m) => m.EditPatient
          ),

        canActivate: [menuAccessGuard('/patients')]
      },
      {
        path: 'patients/:id',

        loadComponent: () =>
          import('./features/patients/patient-details/patient-details').then(
            (m) => m.PatientDetails
          ),

        canActivate: [menuAccessGuard('/patients')]
      },
      {
        path: 'appointments/book',

        loadComponent: () =>
          import(
            './features/appointments/book-appointment/book-appointment'
          ).then((m) => m.BookAppointment),

        canActivate: [menuAccessGuard('/appointments/book')]
      },
      {
        path: 'appointments',

        loadComponent: () =>
          import(
            './features/appointments/appointment-list/appointment-list'
          ).then((m) => m.AppointmentList),

        canActivate: [menuAccessGuard('/appointments')]
      },
      {
        path: 'appointments/requests',

        loadComponent: () =>
          import(
            './features/appointments/appointment-requests/appointment-requests'
          ).then((m) => m.AppointmentRequestsComponent),

        canActivate: [menuAccessGuard('/appointments/requests')]
      },
      {
        path: 'appointments/edit/:id',

        loadComponent: () =>
          import(
            './features/appointments/edit-appointment/edit-appointment'
          ).then((m) => m.EditAppointment),

        canActivate: [menuAccessGuard('/appointments')]
      },
      {
        path: 'doctor-queue',

        loadComponent: () =>
          import('./features/appointments/doctor-queue/doctor-queue').then(
            (m) => m.DoctorQueue
          ),

        canActivate: [menuAccessGuard('/doctor-queue')]
      },
      {
        path: 'consultation/:appointmentId',

        loadComponent: () =>
          import(
            './features/consultations/consultation-form/consultation-form'
          ).then((m) => m.ConsultationForm),

        canActivate: [menuAccessGuard('/doctor-queue')]
      },
      {
        path: 'consultations',

        loadComponent: () =>
          import(
            './features/consultations/consultation-list/consultation-list'
          ).then((m) => m.ConsultationList),

        canActivate: [menuAccessGuard('/medical-records')]
      },
      {
        path: 'doctor-availability',

        loadComponent: () =>
          import(
            './features/doctor/doctor-availability/doctor-availability'
          ).then((m) => m.DoctorAvailability),

        canActivate: [menuAccessGuard('/doctor-availability')]
      },
      {
        path: 'medical-records',

        loadComponent: () =>
          import(
            './features/medical-records/medical-record-repository/medical-record-repository'
          ).then((m) => m.MedicalRecordRepository),

        canActivate: [menuAccessGuard('/medical-records')]
      },
      {
        path: 'medical-records/patient/:patientId',

        loadComponent: () =>
          import(
            './features/medical-records/medical-records/medical-records'
          ).then((m) => m.MedicalRecords),

        canActivate: [menuAccessGuard('/medical-records')]
      },
      {
        path: 'my-profile',

        loadComponent: () =>
          import('./features/profile/my-profile/my-profile').then(
            (m) => m.MyProfile
          )
      },
      {
        path: 'consultations/:id',

        loadComponent: () =>
          import('./features/consultations/consultation-details/consultation-details').then(
            (m) => m.ConsultationDetails
          ),

        canActivate: [menuAccessGuard('/medical-records')]
      }
    ]
  },

  
//routes
  {
    path: '**',

    redirectTo: 'login'
  }
];
