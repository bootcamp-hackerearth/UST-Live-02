import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { DashboardService } from '../../../core/services/dashboard';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorDashboard implements OnInit {
  readonly stats = signal<any>({});
  readonly todayAppointments = signal<any[]>([]);

  constructor(
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly dashboardService: DashboardService
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
