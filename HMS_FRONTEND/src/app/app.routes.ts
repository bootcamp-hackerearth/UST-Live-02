import { Routes } from '@angular/router';

import { Signup} from './pages/signup/signup';
import { Login } from './pages/login/login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth-guard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { Patients } from './pages/patients/patients';
import { Employees} from './pages/employees/employees';
import { Appointments } from './pages/appointments/appointments';
import { Approvals } from './pages/approvals/approvals';
import { ChangePassword } from './pages/change-password/change-password';
import { Profile } from './pages/profile/profile';
import { JoinUs } from './pages/join-us/join-us';
import { Doctors } from './pages/doctors/doctors';

export const routes: Routes = [
      {
    path: 'join-us',
    component: JoinUs
  },
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'signup',component:Signup},
    {path:'login',component:Login},
    {path:'change-password',component:ChangePassword},
    {
  path: 'profile',
  component: Profile,
  
},
    {path:'admin',component:DashboardLayout,canActivate:[authGuard],
        children:[
            {
                path:'dashboard',component:AdminDashboard
            },
            {
                path:'patients',component:Patients
            },
            {
                path:'employees',component:Employees
            },
            {
                path:'appointments',component:Appointments
            },{
                path:'approvals',component:Approvals
            },
            {
                path:'doctors',component:Doctors
            }
             
            
            
        ]
    },

   

    {
        path:"receptionist", component:DashboardLayout,
        canActivate:[authGuard],
        children:[
            {
                path:'patients',component:Patients
            },
            {
                path:'appointments',component:Appointments
            }
        ]
    },

   
    {
        path:"doctor", component:DashboardLayout,
        canActivate:[authGuard],
        children:[
            {
                path:'appointments',component:Appointments
            }
        ]
    }
];
