import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { DashboardService } from '../../../core/services/dashboard';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboard implements OnInit {
  readonly stats = signal<any>({});
  readonly recentEmployees = signal<any[]>([]);

  constructor(
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly dashboardService: DashboardService
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

        this.stats.set(response.data);
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

        this.recentEmployees.set(response.data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
