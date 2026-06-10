import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../../core/services/auth';
import { DashboardService } from '../../../core/services/dashboard';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css'
})
export class DoctorDashboard implements OnInit {
  stats: any = {};

  todayAppointments: any[] = [];

  constructor(
    public readonly authService: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load dashboard data
  ngOnInit(): void {
    this.loadDoctorStats();
    this.loadTodayAppointments();
  }

  // Fetch doctor dashboard statistics
  loadDoctorStats(): void {
    this.dashboardService.getDoctorStats().subscribe({
      next: (response) => {
        console.log(response);

        this.stats = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }

  // Fetch today's appointments
  loadTodayAppointments(): void {
    this.dashboardService.getTodayAppointments().subscribe({
      next: (response) => {
        console.log(response);

        this.todayAppointments = response.data;
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
}