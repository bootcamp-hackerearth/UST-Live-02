import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../../core/services/auth';

import { AdminDashboard } from '../admin-dashboard/admin-dashboard';
import { DoctorDashboard } from '../doctor-dashboard/doctor-dashboard';
import { ReceptionistDashboard } from '../receptionist-dashboard/receptionist-dashboard';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    AsyncPipe,
    AdminDashboard,
    DoctorDashboard,
    ReceptionistDashboard
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHome {
  constructor(
    public readonly authService: AuthService
  ) {}
}