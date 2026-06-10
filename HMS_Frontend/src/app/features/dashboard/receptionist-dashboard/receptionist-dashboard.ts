import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { DashboardService } from '../../../core/services/dashboard';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
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