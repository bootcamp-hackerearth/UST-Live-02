import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../../core/services/auth';
import { DashboardService } from '../../../core/services/dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  stats: any = {};

  recentEmployees: any[] = [];

  constructor(
    public readonly authService: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load dashboard data
  ngOnInit(): void {
    this.loadStats();
    this.loadRecentEmployees();
  }

  // Fetch dashboard statistics
  loadStats(): void {
    this.dashboardService.getAdminStats().subscribe({
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

  // Fetch recently added employees
  loadRecentEmployees(): void {
    this.dashboardService.getRecentEmployees().subscribe({
      next: (response) => {
        console.log(response);

        this.recentEmployees = response.data;
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
}