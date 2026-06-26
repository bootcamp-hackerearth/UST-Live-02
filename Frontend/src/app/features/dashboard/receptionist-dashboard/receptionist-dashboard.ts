import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { DashboardService } from '../../../core/services/dashboard';
import { AuthService } from '../../../core/services/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './receptionist-dashboard.html',
  styleUrl: './receptionist-dashboard.css'
})
export class ReceptionistDashboard implements OnInit {
  stats: any = {};

  todayAppointments: any[] = [];

  constructor(
    public readonly authService: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load dashboard data
  ngOnInit(): void {
    this.loadReceptionStats();
    this.loadTodayAppointments();
  }

  // Fetch receptionist dashboard statistics
  loadReceptionStats(): void {
    this.dashboardService.getReceptionistStats().subscribe({
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
