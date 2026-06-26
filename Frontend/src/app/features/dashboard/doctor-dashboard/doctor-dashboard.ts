import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../../core/services/auth';
import { DashboardService } from '../../../core/services/dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [AsyncPipe],
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

        this.stats = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
      }
    });
  }

  // Fetch today's appointments
  loadTodayAppointments(): void {
    this.dashboardService.getTodayAppointments().subscribe({
      next: (response) => {

        this.todayAppointments = response.data;
      },

      error: (error) => {
      }
    });
  }
}
