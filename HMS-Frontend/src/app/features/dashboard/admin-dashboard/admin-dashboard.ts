import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../../core/services/auth';
import { DashboardService } from '../../../core/services/dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AsyncPipe],
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

        this.stats = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
      }
    });
  }

  // Fetch recently added employees
  loadRecentEmployees(): void {
    this.dashboardService.getRecentEmployees().subscribe({
      next: (response) => {

        this.recentEmployees = response.data;
      },

      error: (error) => {
      }
    });
  }
}
