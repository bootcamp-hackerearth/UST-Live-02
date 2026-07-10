import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard';
import { AuthService } from '../../../core/services/auth';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './receptionist-dashboard.html',
  styleUrl: './receptionist-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceptionistDashboard implements OnInit {
  readonly stats = signal<any>({});
  readonly todayAppointments = signal<any[]>([]);

  constructor(
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly dashboardService: DashboardService
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

        this.stats.set(response.data);
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

        this.todayAppointments.set(response.data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
